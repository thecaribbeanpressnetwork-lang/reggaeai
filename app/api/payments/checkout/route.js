import crypto from 'node:crypto';
import { auth } from '../../../../auth';
import { databaseConfigured, query } from '../../../../lib/db';
import { createHostedCheckout, getWiPayConfig, wiPayReadyForLive } from '../../../lib/payments/wipay';

const SANDBOX_PRODUCTS = {
  'reggaeai-test-1': { name: 'ReggaeAI sandbox test', amount: 1.00, currency: 'USD' }
};

function orderId() {
  return `rai_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ ok: false, state: 'AUTH_REQUIRED' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const productId = typeof body?.productId === 'string' ? body.productId : '';
  const config = getWiPayConfig();
  let product;
  let userId = null;

  if (config.environment === 'live') {
    if (!wiPayReadyForLive(config)) return Response.json({ ok: false, state: 'PROVIDER_REQUIRED', error: 'WiPay live credentials are incomplete.' }, { status: 503 });
    if (!databaseConfigured()) return Response.json({ ok: false, state: 'DATABASE_REQUIRED' }, { status: 503 });
    if (!productId) return Response.json({ ok: false, state: 'INVALID_REQUEST' }, { status: 400 });

    const [productResult, userResult] = await Promise.all([
      query(`select id, product_type, currency, amount from products where id = $1 and active = true limit 1`, [productId]),
      query('select id from users where email = $1 limit 1', [session.user.email.toLowerCase()])
    ]);
    product = productResult.rows[0];
    userId = userResult.rows[0]?.id;
    if (!product || !userId) return Response.json({ ok: false, state: !product ? 'PRODUCT_NOT_FOUND' : 'ACCOUNT_NOT_PERSISTED' }, { status: 404 });
  } else {
    product = SANDBOX_PRODUCTS[productId];
    if (!product) return Response.json({ ok: false, state: 'BLOCKED', error: 'Unknown sandbox product.' }, { status: 400 });
    if (databaseConfigured()) {
      const userResult = await query('select id from users where email = $1 limit 1', [session.user.email.toLowerCase()]);
      userId = userResult.rows[0]?.id || null;
    }
  }

  const externalOrderId = orderId();
  try {
    if (databaseConfigured()) {
      await query(
        `insert into orders (external_order_id, buyer_user_id, status, currency, gross_amount, processor)
         values ($1,$2,'pending',$3,$4,'wipay')`,
        [externalOrderId, userId, product.currency, product.amount]
      );
      if (config.environment === 'live') {
        const order = await query('select id from orders where external_order_id = $1', [externalOrderId]);
        await query(`insert into order_items (order_id, product_id, unit_amount, quantity) values ($1,$2,$3,1)`, [order.rows[0].id, product.id, product.amount]);
      }
    }

    const checkout = await createHostedCheckout({
      orderId: externalOrderId,
      total: product.amount,
      currency: product.currency,
      data: { productId, productName: product.name || product.product_type || 'ReggaeAI purchase' }
    });

    if (databaseConfigured()) await query('update orders set processor_transaction_id = $1 where external_order_id = $2', [checkout.transaction_id, externalOrderId]);

    return Response.json({ ok: true, state: 'CHECKOUT_CREATED', orderId: externalOrderId, checkoutUrl: checkout.url, transactionId: checkout.transaction_id, environment: checkout.environment });
  } catch (error) {
    console.error('checkout_create_failed', error?.message || error);
    if (databaseConfigured()) await query("update orders set status = 'failed' where external_order_id = $1 and status = 'pending'", [externalOrderId]).catch(() => {});
    return Response.json({ ok: false, state: 'ERROR', error: 'Checkout could not be created.' }, { status: 502 });
  }
}
