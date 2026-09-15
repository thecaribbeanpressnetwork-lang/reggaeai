import { notFound } from 'next/navigation';
import { getPublicProduction } from '../../lib/publicCatalogue';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const production = await getPublicProduction(slug);
  if (!production) return { title: 'Riddim not found | ReggaeAI' };
  return {
    title: `${production.title} | The Riddim Yard | ReggaeAI`,
    description: `Production details and songs connected to ${production.title} in the ReggaeAI Riddim Yard.`
  };
}

export default async function RiddimPage({ params }) {
  const { slug } = await params;
  const production = await getPublicProduction(slug);
  if (!production) notFound();

  const type = production.productionType || production.production_type || 'production';
  const rights = production.rightsState || production.rights_state || 'discovered';

  return (
    <main className="detailShell">
      <section className="detailHero riddimHero">
        <div>
          <span className="eyebrow">THE RIDDIM YARD · {String(type).replaceAll('_',' ').toUpperCase()}</span>
          <h1>{production.title}</h1>
          <div className="factRow">
            {production.producer_name ? <span>Producer: {production.producer_name}</span> : null}
            {production.bpm ? <span>{production.bpm} BPM</span> : null}
            {production.musical_key ? <span>Key: {production.musical_key}</span> : null}
            <span>Rights: {String(rights).replaceAll('_',' ')}</span>
          </div>
          {rights === 'DEMO_METADATA_ONLY' ? <div className="truthPanel"><strong>Metadata demonstration only.</strong><span>No licence or audio is being offered from this seed item.</span></div> : null}
        </div>
        <div className="detailMark"><img src="/reggaeai-lion.svg" alt="" /></div>
      </section>

      <section className="detailSection">
        <div className="sectionHeading"><span className="eyebrow">VOICED ON THIS PRODUCTION</span><h2>Songs connected to the riddim</h2></div>
        <div className="resultGrid">
          {(production.songs || []).map((song) => (
            <a className="resultCard" key={song.slug} href={`/music/${song.slug}`}>
              <span className="resultType">song</span>
              <strong>{song.title}</strong>
              <span>{song.artist_name || 'Artist'} →</span>
            </a>
          ))}
          {!production.songs?.length ? <div className="emptyState"><strong>No public songs linked yet.</strong><span>ReggaeAI only shows verified catalogue relationships here.</span></div> : null}
        </div>
      </section>
    </main>
  );
}
