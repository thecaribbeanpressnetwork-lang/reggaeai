import { notFound } from 'next/navigation';

const genres = {
  'ai-reggae': { name: 'AI Reggae Music', description: 'Caribbean reggae created with AI assistance or generation, spanning roots, modern reggae, dub, lovers rock and country reggae.' },
  'ai-soca': { name: 'AI Soca Music', description: 'AI-assisted and AI-generated soca rooted in Caribbean carnival energy, including power and groovy soca traditions.' },
  'ai-calypso': { name: 'AI Calypso Music', description: 'AI-created calypso informed by Trinidad and Tobago’s lyrical, narrative and rhythmic tradition.' },
  'ai-kaiso': { name: 'AI Kaiso Music', description: 'AI-assisted kaiso presented as its own Caribbean tradition rather than flattened into a generic calypso label.' },
  'ai-extempo': { name: 'AI Extempo', description: 'AI explorations of extempo, preserving its identity as a distinct improvisational Trinidad and Tobago vocal form.' },
  'ai-steelpan': { name: 'AI Steelpan Music', description: 'AI-assisted steelpan compositions and instrumentals built around the Caribbean steel orchestra tradition.' },
  'caribbean-ai-hip-hop': { name: 'Caribbean AI Hip Hop', description: 'AI-assisted hip hop and rap shaped by Caribbean cadence, language, production and regional identity.' },
  'ai-dancehall': { name: 'AI Dancehall', description: 'AI-assisted dancehall rooted in Jamaican rhythmic language and Caribbean sound-system culture.' },
  'country-reggae': { name: 'Country Reggae', description: 'The meeting point between reggae rhythm, Caribbean storytelling and country songcraft.' },
  'roots-reggae': { name: 'Roots Reggae', description: 'Roots-focused reggae catalogue emphasizing bass, one-drop feel, dub space and conscious songwriting.' }
};

export function generateStaticParams() {
  return Object.keys(genres).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const genre = genres[slug];
  if (!genre) return {};
  return { title: genre.name, description: genre.description };
}

export default async function GenrePage({ params }) {
  const { slug } = await params;
  const genre = genres[slug];
  if (!genre) notFound();

  return (
    <main className="content" style={{paddingTop:56}}>
      <p className="eyebrow">REGGAEAI GENRE GUIDE + CATALOGUE</p>
      <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(3rem,8vw,6.5rem)',margin:'10px 0'}}>{genre.name}</h1>
      <p style={{maxWidth:820,color:'#bfb6a8',fontSize:'1.08rem',lineHeight:1.75}}>{genre.description}</p>
      <section className="rail" style={{marginTop:48}}>
        <div className="railHeader"><h2>Current catalogue</h2></div>
        <p style={{color:'#8f887d'}}>Tracks will populate here automatically as creator imports and ReggaeAI releases are classified into this genre.</p>
      </section>
      <p><a className="secondary linkButton" href="/">← Back to Discover</a></p>
    </main>
  );
}
