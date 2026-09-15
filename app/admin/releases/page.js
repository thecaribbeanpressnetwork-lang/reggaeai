import { auth } from '../../../auth';
import { isAdminSession } from '../../../lib/access';
import { databaseConfigured, query } from '../../../lib/db';

export const metadata = { title: 'Release Intelligence | ReggaeAI Admin', robots: { index: false, follow: false } };

export default async function ReleaseAdminPage() {
  const session = await auth();
  if (!isAdminSession(session)) return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">FOUNDER CONTROL</span><h1>Admin required.</h1><div className="accountState">ADMIN REQUIRED</div></section></main>;
  if (!databaseConfigured()) return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">RELEASE INTELLIGENCE</span><h1>No operational database yet.</h1><p>Readiness architecture is built, but exceptions cannot be presented as live records until storage is attached.</p><div className="accountState">DATABASE REQUIRED</div></section></main>;

  const result = await query(`
    select r.slug, r.title, a.display_name as artist, rr.readiness_state, rr.score, rr.blockers,
           rr.rights_state, rr.provenance_state, rr.credits_state, rr.metadata_state
    from recordings r
    left join artists a on a.id = r.primary_artist_id
    left join release_readiness rr on rr.recording_id = r.id
    where coalesce(rr.readiness_state, 'discovered') <> 'verified_complete'
    order by r.updated_at desc limit 100
  `);

  return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">REVIEW → APPROVE</span><h1>Release exceptions.</h1><p>Only unresolved records appear here. A high score cannot override rights or provenance blockers.</p></section><section className="adminList">{result.rows.length ? result.rows.map((row) => <a key={row.slug} href={`/music/${row.slug}`}><div><strong>{row.title}</strong><span>{row.artist || 'Artist pending'} · {row.readiness_state || 'discovered'}</span></div><div><span>{row.score || 0}%</span><span>{Array.isArray(row.blockers) ? row.blockers.length : 0} blockers</span></div></a>) : <div className="emptyState"><strong>No unresolved records.</strong><span>This means the operational database currently has no release exceptions—not that external distribution is complete.</span></div>}</section></main>;
}
