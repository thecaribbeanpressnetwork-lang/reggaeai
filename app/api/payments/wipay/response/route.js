import { databaseConfigured, query } from '../../../../../lib/db';
import { verifyWiPayResponse } from '../../../../lib/payments/wipay';

function money(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : null;
}

export async function GET(request) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const transactionId = url.searchParams.get('transaction_id');
  const orderId = url.searchParams.get('order_id');
  const total = url.searchParams.get('total');
  const hash = url.searchParams.get('hash');
  const currency = (url.searchParams.get('currency') || 'USD').toUpperCase();
  const hashVerified = status === 'success' && verifyWiPayResponse({ transactionId, total, hash });

  let state = hashVerified ? 'VERIFIED_NOT_RECONCILED' : 'UNVERIFIED';

  if (hashVerified && databaseConfigured() && orderId) {
    const orderResult = await query(`select * from orders where external_order_id = $1 limit 1`, [orderId]);
    const order = orderResult.rows[0];
    const matches = Boolean(
      order &&
      order.status === 'pending' &&
      (!order.processor_transaction_id || order.processor_transaction_id === transactionId) &&
      order.currency === currency &&
      money(order.gross_amount) === money(total)
    );

    if (matches) {
      const client = await (await import('../../../../../lib/db')).getPool().connect();
      try {
        await client.query('begin');
        const locked = await client.query(`select * from orders where id = $1 for update`, [order.id]);
        if (locked.rows[0]?.status === 'pending') {
          await client.query(`update orders set status = 'paid', processor_verified = true, processor_transaction_id = $1, paid_at = now() where id = $2`, [transactionId, order.id]);
          await client.query(`insert into revenue_events (order_id, event_type, amount, currency, metadata) values ($1,'sale',$2,$3,$4::jsonb)`, [order.id, order.gross_amount, order.currency, JSON.stringify({ processor: 'wipay', transactionId, verification: 'hash+ledger_match' })]);
          if (order.buyer_user_id) {
            await client.query(`
              insert into download_entitlements (user_id, order_item_id)
              select $1, oi.id from order_items oi
              join products p on p.id = oi.product_id
              where oi.order_id = $2 and p.product_type = 'track_download'
              on conflict (order_item_id) do nothing`, [order.buyer_user_id, order.id]);
          }
        }
        await client.query('commit');
        state = 'VERIFIED_COMPLETE';
      } catch (error) {
        await client.query('rollback');
        console.error('wipay_reconciliation_failed', error?.message || error);
        state = 'BLOCKED';
      } finally {
        client.release();
      }
    } else {
      state = 'MISMATCH_BLOCKED';
      console.warn('wipay_ledger_mismatch', { orderId, transactionId, currency, total });
    }
  } else if (hashVerified && !databaseConfigured()) {
    state = 'VERIFIED_NOT_PERSISTED';
  }

  const destination = new URL('/account/library', request.url);
  destination.searchParams.set('payment', state.toLowerCase());
  if (orderId) destination.searchParams.set('order', orderId);
  return Response.redirect(destination, 303);
}
