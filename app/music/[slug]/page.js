import { notFound } from 'next/navigation';
import { getPublicRecording } from '../../lib/publicCatalogue';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const track = await getPublicRecording(slug);
  if (!track) return { title: 'Track not found | ReggaeAI' };
  const artist = track.artist?.displayName || 'ReggaeAI artist';
  return {
    title: `${track.title} — ${artist} | ReggaeAI`,
    description: `${track.title} by ${artist}. ${track.primaryGenre || track.primary_genre || 'Caribbean AI music'} on ReggaeAI.`
  };
}

export default async function TrackPage({ params }) {
  const { slug } = await params;
  const track = await getPublicRecording(slug);
  if (!track) notFound();

  const artistName = track.artist?.displayName || 'Artist';
  const artistSlug = track.artist?.slug;
  const audioAvailable = Boolean(track.audioUrl || track.audio_url);
  const art = track.artworkUrl || track.artwork_url;
  const state = track.publicationState || track.publication_state || 'CATALOGUED';
  const rightsState = track.rightsState || track.rights_state || 'TO VERIFY';

  return (
    <main className="detailShell">
      <section className="trackHero">
        <div className="trackArtwork">{art ? <img src={art} alt={`${track.title} artwork`} /> : <img src="/reggaeai-lion.svg" alt="" className="placeholderLion" />}</div>
        <div className="trackInfo">
          <span className="eyebrow">{String(state).toUpperCase()}</span>
          <h1>{track.title}</h1>
          <p className="trackArtist">{artistSlug ? <a href={`/artists/${artistSlug}`}>{artistName}</a> : artistName}</p>
          <div className="factRow">
            <span>{track.primaryGenre || track.primary_genre || 'Genre pending'}</span>
            {track.labelName ? <span>{track.labelName}</span> : null}
            <span>Rights: {String(rightsState).replaceAll('_',' ')}</span>
          </div>
          {audioAvailable ? (
            <audio className="nativeAudio" controls preload="metadata" src={track.audioUrl || track.audio_url}>Your browser does not support audio playback.</audio>
          ) : (
            <div className="truthPanel"><strong>Audio not public yet.</strong><span>ReggaeAI will not expose a play button until an authorized published audio file exists.</span></div>
          )}
        </div>
      </section>

      <section className="detailSection splitDetail">
        <div><span className="eyebrow">PROVENANCE</span><h2>What ReggaeAI can say now</h2></div>
        <div className="factList">
          <div><span>Artist type</span><strong>{track.artist?.artistType === 'ai_persona' ? 'AI persona' : track.artist?.artistType || 'Not stated'}</strong></div>
          <div><span>Publication state</span><strong>{String(state).replaceAll('_',' ')}</strong></div>
          <div><span>Rights state</span><strong>{String(rightsState).replaceAll('_',' ')}</strong></div>
          {track.isrcState ? <div><span>ISRC</span><strong>{String(track.isrcState).replaceAll('_',' ')}</strong></div> : null}
        </div>
      </section>
    </main>
  );
}
