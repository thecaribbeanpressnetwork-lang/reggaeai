import { auth } from '../../../auth';
import { databaseConfigured, query } from '../../../lib/db';

export const metadata = { title: 'Earnings | ReggaeAI', robots: { index: false, follow: false } };

export default async function EarningsPage() {
  const session = await auth();
  if (!session?.user?.email) return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">CREATOR EARNINGS</span><h1>Your USD ledger.</h1><p>Sign in to view verified creator balances and payout history.</p><a className="primary linkButton authAction" href="/signin">Sign in</a></section></main>;
  if (!databaseConfigured()) return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">CREATOR EARNINGS</span><h1>No balance is being invented.</h1><p>The creator ledger activates when persistent storage is connected.</p><div className="accountState">DATABASE REQUIRED</div></section></main>;

  const user = await query('select id from users where email=$1 limit 1',[session.user.email.toLowerCase()]);
  const userId=user.rows[0]?.id;
  const balances = userId ? await query(`select coalesce(sum(cb.available_usd),0)::numeric as available, coalesce(sum(cb.pending_usd),0)::numeric as pending, coalesce(sum(cb.lifetime_usd),0)::numeric as lifetime from rights_holders rh left join creator_balances cb on cb.rights_holder_id=rh.id where rh.user_id=$1`,[userId]) : {rows:[{available:0,pending:0,lifetime:0}]};
  const payouts = userId ? await query(`select p.amount_usd,p.status,p.scheduled_for,p.paid_at,p.provider_reference from payouts p join rights_holders rh on rh.id=p.rights_holder_id where rh.user_id=$1 order by p.created_at desc limit 24`,[userId]) : {rows:[]};
  const b=balances.rows[0];

  return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">CREATOR EARNINGS</span><h1>Simple USD accounting.</h1><p>Balances settle on a monthly cycle. The minimum payout is US$25; smaller balances roll forward automatically.</p></section><section className="balanceGrid"><article><span>Available</span><strong>US${Number(b.available||0).toFixed(2)}</strong><small>Eligible for the next payout cycle once above threshold.</small></article><article><span>Pending</span><strong>US${Number(b.pending||0).toFixed(2)}</strong><small>Verified accruals still inside the settlement window.</small></article><article><span>Lifetime</span><strong>US${Number(b.lifetime||0).toFixed(2)}</strong><small>Confirmed creator accruals recorded in the ledger.</small></article></section><section className="payoutPolicy"><div><span className="eyebrow">PAYOUT POLICY</span><h2>Monthly. USD. Minimum US$25.</h2></div><p>No payout is marked paid until the payout provider confirms settlement. Refunds, chargebacks and processor fees must be reconciled before creator payable balances are released.</p></section><section className="adminList payoutHistory">{payouts.rows.map((p,i)=><div className="payoutRow" key={`${p.scheduled_for}-${i}`}><div><strong>US${Number(p.amount_usd).toFixed(2)}</strong><span>{p.status}</span></div><div><span>Scheduled {String(p.scheduled_for)}</span>{p.paid_at?<span>Paid {new Date(p.paid_at).toLocaleDateString()}</span>:null}</div></div>)}{!payouts.rows.length?<div className="emptyState"><strong>No payout records yet.</strong><span>Zero balances are not fabricated as earnings.</span></div>:null}</section></main>;
}
