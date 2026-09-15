import { searchPublicCatalogue } from '../lib/publicCatalogue';

export const metadata = {
  title: 'Search Caribbean AI Music | ReggaeAI',
  description: 'Search ReggaeAI artists, songs, releases, riddims and Caribbean AI music genres.'
};

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const q = String(params?.q || '').trim();
  const results = q ? await searchPublicCatalogue(q) : [];

  return (
    <main className="detailShell searchShell">
      <section className="detailHero compact">
        <span className="eyebrow">SEARCH REGGAEAI</span>
        <h1>Find the sound, artist or riddim.</h1>
        <form className="searchForm" action="/search" method="get">
          <input name="q" defaultValue={q} placeholder="Search artists, songs, riddims, releases…" aria-label="Search ReggaeAI" />
          <button className="primary" type="submit">Search</button>
        </form>
      </section>

      <section className="resultGrid" aria-live="polite">
        {!q ? <div className="emptyState"><strong>Start with a name or genre.</strong><span>Try Aven Indigo, Country Reggae, AI Kaiso or riddim.</span></div> : null}
        {q && !results.length ? <div className="emptyState"><strong>No public match yet.</strong><span>ReggaeAI only returns catalogue items it can currently identify.</span></div> : null}
        {results.map((item) => (
          <a key={`${item.type}-${item.slug}`} className="resultCard" href={item.href}>
            <span className="resultType">{item.type}</span>
            <strong>{item.name}</strong>
            <span>→</span>
          </a>
        ))}
      </section>
    </main>
  );
}
