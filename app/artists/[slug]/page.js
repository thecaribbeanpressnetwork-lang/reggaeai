import { notFound } from 'next/navigation';
import { getPublicArtist } from '../../lib/publicCatalogue';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const artist = await getPublicArtist(slug);
  if (!artist) return { title: 'Artist not found | ReggaeAI' };
  return {
    title: `${artist.displayName} | ReggaeAI`,
    description: artist.bio || `Discover ${artist.displayName} on ReggaeAI.`
  };
}

export default async function ArtistPage({ params }) {
  const { slug } = await params;
  const artist = await getPublicArtist(slug);
  if (!artist) notFound();

  return (
    <main className="detailShell">
      <section className="detailHero artistHero">
        <div>
          <span className="eyebrow">{String(artist.artistType || artist.artist_type || 'artist').replaceAll('_',' ').toUpperCase()}</span>
          <h1>{artist.displayName}</h1>
          <p>{artist.bio || 'Artist profile.'}</p>
          {artist.artistType === 'ai_persona' || artist.artist_type === 'ai_persona' ? <span className="truthBadge">AI PERSONA · TRANSPARENT</span> : null}
        </div>
        <div className="detailMark"><img src="/reggaeai-lion.svg" alt="" /></div>
      </section>

      <section className="detailSection">
        <div className="sectionHeading"><span className="eyebrow">MUSIC</span><h2>Public catalogue</h2></div>
        <div className="resultGrid">
          {(artist.tracks || []).map((track) => (
            <a className="resultCard" key={track.slug} href={`/music/${track.slug}`}>
              <span className="resultType">{track.publication_state || track.publicationState || 'catalogue'}</span>
              <strong>{track.title}</strong>
              <span>→</span>
            </a>
          ))}
          {!artist.tracks?.length ? <div className="emptyState"><strong>No public tracks yet.</strong><span>Draft and rights-pending recordings are not shown as released music.</span></div> : null}
        </div>
      </section>

      {!artist.verified ? <section className="claimStrip"><div><span className="eyebrow">ARTIST OWNERSHIP</span><strong>Is this your artist profile?</strong></div><a href="/account/creator">Claim artist profile →</a></section> : null}
    </main>
  );
}
