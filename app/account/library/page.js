import { auth } from '../../../auth';
import { databaseConfigured, query } from '../../../lib/db';

export const metadata = { title: 'Library | ReggaeAI', robots: { index: false, follow: false } };

export default async function LibraryPage({ searchParams }) {
  const session = await auth();
  const params = await searchParams;
  if (!session?.user?.email) return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">YOUR LIBRARY</span><h1>Saved and purchased music.</h1><p>Public browsing stays open. Sign in only when you want a private library.</p><a className="primary linkButton authAction" href="/signin">Sign in</a></section></main>;
  if (!databaseConfigured()) return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">YOUR LIBRARY</span><h1>Account connected. Storage pending.</h1><p>Your identity is available, but the persistent catalogue database is not connected yet.</p><div className="accountState">DATABASE REQUIRED</div></section></main>;

  const userResult = await query('select id from users where email = $1 limit 1', [session.user.email.toLowerCase()]);
  const userId = userResult.rows[0]?.id;
  if (!userId) return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">YOUR LIBRARY</span><h1>Account record pending.</h1><div className="accountState">ACCOUNT NOT PERSISTED</div></section></main>;

  const [saved, purchases] = await Promise.all([
    query(`select coalesce(r.slug,p.slug) as slug, coalesce(r.title,p.title) as title, case when r.id is not null then 'track' else 'riddim' end as type from saved_items s left join recordings r on r.id=s.recording_id left join productions p on p.id=s.production_id where s.user_id=$1 order by s.created_at desc limit 100`, [userId]),
    query(`select o.external_order_id, o.paid_at, pr.product_type, r.slug as track_slug, r.title as track_title, p.slug as production_slug, p.title as production_title, de.id is not null as downloadable from orders o join order_items oi on oi.order_id=o.id join products pr on pr.id=oi.product_id left join recordings r on r.id=pr.recording_id left join productions p on p.id=pr.production_id left join download_entitlements de on de.order_item_id=oi.id and de.user_id=$1 where o.buyer_user_id=$1 and o.status='paid' and o.processor_verified=true order by o.paid_at desc limit 100`, [userId])
  ]);

  return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">YOUR LIBRARY</span><h1>Saved and purchased music.</h1><p>Only verified paid purchases and your private saves appear here.</p>{params?.payment ? <div className="accountState">PAYMENT · {String(params.payment).replaceAll('_',' ').toUpperCase()}</div> : null}</section><section className="detailSection"><div className="sectionHeading"><span className="eyebrow">PURCHASES & LICENCES</span><h2>{purchases.rows.length}</h2></div><div className="resultGrid">{purchases.rows.map((item) => { const slug=item.track_slug||item.production_slug; const title=item.track_title||item.production_title; const href=item.track_slug?`/music/${slug}`:`/riddims/${slug}`; return <a className="resultCard" key={`${item.external_order_id}-${slug}`} href={href}><span className="resultType">{item.product_type}</span><strong>{title}</strong><span>{item.downloadable?'ENTITLED':'VERIFIED'} →</span></a>; })}{!purchases.rows.length?<div className="emptyState"><strong>No verified purchases yet.</strong><span>Unverified or failed payments are never shown as owned.</span></div>:null}</div></section><section className="detailSection"><div className="sectionHeading"><span className="eyebrow">SAVED</span><h2>{saved.rows.length}</h2></div><div className="resultGrid">{saved.rows.map((item)=><a className="resultCard" key={`${item.type}-${item.slug}`} href={item.type==='track'?`/music/${item.slug}`:`/riddims/${item.slug}`}><span className="resultType">{item.type}</span><strong>{item.title}</strong><span>→</span></a>)}{!saved.rows.length?<div className="emptyState"><strong>Nothing saved yet.</strong><span>Your public browsing history is not presented as a saved library.</span></div>:null}</div></section></main>;
}
