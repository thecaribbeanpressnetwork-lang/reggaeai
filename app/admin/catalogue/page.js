import { auth } from '../../../auth';
import { isAdminSession } from '../../../lib/access';
import { databaseConfigured, query } from '../../../lib/db';

export const metadata = { title: 'Catalogue | ReggaeAI Admin', robots: { index: false, follow: false } };

export default async function CatalogueAdminPage() {
  const session = await auth();
  if (!isAdminSession(session)) return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">FOUNDER CONTROL</span><h1>Admin required.</h1><div className="accountState">ADMIN REQUIRED</div></section></main>;
  if (!databaseConfigured()) return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">CATALOGUE</span><h1>Persistent catalogue not connected.</h1><p>The canonical schema and migrations are ready; no fake catalogue counts are shown.</p><div className="accountState">DATABASE REQUIRED</div></section></main>;

  const counts = await Promise.all(['artists','recordings','releases','productions','genres','videos','imports'].map(async (table) => {
    const result = await query(`select count(*)::int as count from ${table}`);
    return [table, result.rows[0].count];
  }));
  const recent = await query(`select r.title, r.slug, r.publication_state, r.rights_state, a.display_name as artist from recordings r left join artists a on a.id = r.primary_artist_id order by r.created_at desc limit 20`);

  return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">CANONICAL CATALOGUE</span><h1>One operating truth.</h1><p>Counts and recent recording states are read directly from the production database.</p></section><section className="balanceGrid adminCounts">{counts.map(([name,count]) => <article key={name}><span>{name}</span><strong>{count}</strong><small>canonical records</small></article>)}</section><section className="adminList">{recent.rows.map((row) => <a key={row.slug} href={`/music/${row.slug}`}><div><strong>{row.title}</strong><span>{row.artist || 'Artist pending'}</span></div><div><span>{row.publication_state}</span><span>{row.rights_state}</span></div></a>)}</section></main>;
}
