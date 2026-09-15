import PromoteImportButton from '../../components/PromoteImportButton';
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
  const [recent,promotable] = await Promise.all([
    query(`select r.title, r.slug, r.publication_state, r.rights_state, a.display_name as artist from recordings r left join artists a on a.id = r.primary_artist_id order by r.created_at desc limit 20`),
    query(`select id,source_provider,canonical_url,source_url,resolved_metadata,rights_confirmed,state from imports where rights_confirmed=true and state<>'catalogued' order by created_at asc limit 50`)
  ]);

  return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">CANONICAL CATALOGUE</span><h1>One operating truth.</h1><p>Counts and recording states are read directly from production. Rights-confirmed imports can be promoted into draft catalogue records here without being auto-published.</p></section><section className="balanceGrid adminCounts">{counts.map(([name,count]) => <article key={name}><span>{name}</span><strong>{count}</strong><small>canonical records</small></article>)}</section><section className="detailSection"><div className="sectionHeading"><span className="eyebrow">READY FOR CATALOGUE DRAFT</span><h2>{promotable.rows.length}</h2></div><div className="adminList">{promotable.rows.map((row)=>{const meta=row.resolved_metadata||{};return <div className="payoutRow" key={row.id}><div><strong>{meta.title||'Title needs review'}</strong><span>{row.source_provider} · {row.canonical_url||row.source_url}</span></div><div><PromoteImportButton importId={row.id} disabled={!meta.title}/></div></div>;})}{!promotable.rows.length?<div className="emptyState"><strong>No rights-confirmed imports waiting.</strong><span>Creator rights confirmation is required before an import can enter the catalogue as a draft.</span></div>:null}</div></section><section className="detailSection"><div className="sectionHeading"><span className="eyebrow">RECENT RECORDINGS</span><h2>{recent.rows.length}</h2></div><div className="adminList">{recent.rows.map((row) => <a key={row.slug} href={`/music/${row.slug}`}><div><strong>{row.title}</strong><span>{row.artist || 'Artist pending'}</span></div><div><span>{row.publication_state}</span><span>{row.rights_state}</span></div></a>)}</div></section></main>;
}
