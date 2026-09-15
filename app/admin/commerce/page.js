import { auth } from '../../../auth';
import { isAdminSession } from '../../../lib/access';
import { databaseConfigured, query } from '../../../lib/db';
import { getWiPayConfig, wiPayReadyForLive } from '../../lib/payments/wipay';

export const metadata = { title: 'Commerce | ReggaeAI Admin', robots: { index: false, follow: false } };

export default async function CommerceAdminPage() {
  const session = await auth();
  if (!isAdminSession(session)) return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">FOUNDER CONTROL</span><h1>Admin required.</h1><div className="accountState">ADMIN REQUIRED</div></section></main>;
  const wipay = getWiPayConfig();
  const liveReady = wiPayReadyForLive(wipay);
  let metrics = null;
  if (databaseConfigured()) {
    const [orders, balances, payouts] = await Promise.all([
      query(`select count(*)::int as total, count(*) filter (where processor_verified)::int as verified from orders`),
      query(`select coalesce(sum(pending_usd),0)::numeric as pending, coalesce(sum(available_usd),0)::numeric as available from creator_balances`),
      query(`select count(*)::int as total, count(*) filter (where status = 'paid')::int as paid from payouts`)
    ]);
    metrics = { orders: orders.rows[0], balances: balances.rows[0], payouts: payouts.rows[0] };
  }
  return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">COLLECT · RECONCILE · PAY</span><h1>Commerce truth.</h1><p>Processor verification, catalogue pricing, creator accruals and payouts remain separate ledgers so money cannot silently change rights or ownership.</p><div className="capabilityRow"><span data-ready={wipay.environment === 'sandbox' || liveReady}>WiPay {wipay.environment}</span><span data-ready={liveReady}>Live credentials</span><span data-ready={databaseConfigured()}>Ledger database</span></div></section>{metrics ? <section className="balanceGrid"><article><span>Orders</span><strong>{metrics.orders.total}</strong><small>{metrics.orders.verified} processor verified</small></article><article><span>Creator available</span><strong>US${Number(metrics.balances.available).toFixed(2)}</strong><small>Pending US${Number(metrics.balances.pending).toFixed(2)}</small></article><article><span>Payouts</span><strong>{metrics.payouts.total}</strong><small>{metrics.payouts.paid} confirmed paid</small></article></section> : <section className="emptyState"><strong>Database not connected.</strong><span>WiPay sandbox configuration exists, but there is no persistent transaction ledger yet.</span></section>}<section className="payoutPolicy"><div><span className="eyebrow">PAYOUT POLICY</span><h2>Monthly · US$25 minimum</h2></div><p>Balances below US$25 roll forward. ReggaeAI never marks a payout paid until the payout provider confirms settlement. Live customer checkout remains fail-closed until credentials and server-side product pricing are present.</p></section></main>;
}
