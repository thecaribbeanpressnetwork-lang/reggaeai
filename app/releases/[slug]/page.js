import { notFound } from 'next/navigation';
import { getPublicRelease } from '../../lib/publicCatalogue';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const release = await getPublicRelease(slug);
  if (!release) return { title: 'Release not found | ReggaeAI' };
  return { title: `${release.title} | ReggaeAI`, description: `Listen to and explore ${release.title} on ReggaeAI.` };
}

export default async function ReleasePage({ params }) {
  const { slug } = await params;
  const release = await getPublicRelease(slug);
  if (!release) notFound();

  return (
    <main className="detailShell">
      <section className="detailHero">
        <div>
          <span className="eyebrow">{String(release.release_type || 'RELEASE').replaceAll('_',' ').toUpperCase()}</span>
          <h1>{release.title}</h1>
          <div className="factRow">
            {release.artist_name ? <span>{release.artist_name}</span> : null}
            {release.label_name ? <span>{release.label_name}</span> : null}
            {release.release_date ? <span>{new Date(release.release_date).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}</span> : null}
          </div>
        </div>
        <div className="detailMark"><img src="/reggaeai-lion.svg" alt="" /></div>
      </section>
      <section className="detailSection">
        <div className="sectionHeading"><span className="eyebrow">TRACKLIST</span><h2>{release.tracks.length} {release.tracks.length === 1 ? 'track' : 'tracks'}</h2></div>
        <div className="resultGrid">
          {release.tracks.map((track) => (
            <a className="resultCard" key={track.slug} href={`/music/${track.slug}`}>
              <span className="resultType">{track.disc_number}.{track.track_number}</span><strong>{track.title}</strong><span>→</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
