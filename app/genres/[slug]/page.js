import { notFound } from 'next/navigation';
import { databaseConfigured, query } from '../../../lib/db';
import { caribbeanGenreOptions, genreIntelligence } from '../../../lib/caribbeanGenres';

const aiLanding = {
  'ai-reggae':'Reggae','ai-soca':'Soca','ai-calypso':'Calypso','ai-kaiso':'Kaiso','ai-extempo':'Extempo','ai-steelpan':'AI Steelpan','ai-dancehall':'Dancehall','caribbean-ai-hip-hop':'Caribbean Hip Hop'
};
const allGenres = Object.fromEntries(caribbeanGenreOptions.map(g=>[g.slug,g.label]));
const genreNames = {...allGenres,...aiLanding};

function descriptionFor(slug,name){
  const special={
    'kaiso':'Kaiso is preserved as its own Trinidad and Tobago tradition rather than being flattened into a generic calypso label.',
    'extempo':'Extempo is presented as a distinct improvisational Trinidad and Tobago vocal tradition.',
    'santimanitay':'Santimanitay is treated as a distinct challenge/refrain tradition connected to extempo and Kalinda contexts.',
    'lavway':'Lavway / Lavwé is treated as a call-and-response chant tradition associated with Trinidad and Tobago Kalinda stickfighting.',
    'country-reggae':'Country Reggae brings reggae rhythmic language together with country storytelling and songcraft.',
    'ai-steelpan':'AI Steelpan focuses on AI-assisted music centered on realistic steelpan phrasing and Caribbean arrangement.'
  };
  return special[slug]||`ReggaeAI’s Caribbean-first guide and public catalogue for ${name}, with creator tools that preserve genre identity instead of reducing it to a generic “island” tag.`;
}

export function generateStaticParams(){return Object.keys(genreNames).map(slug=>({slug}));}
export async function generateMetadata({params}){const{slug}=await params;const name=genreNames[slug];if(!name)return{};return{title:`${slug.startsWith('ai-')?'AI ':''}${name} Music`,description:descriptionFor(slug,name)};}

export default async function GenrePage({params}){
  const{slug}=await params;const name=genreNames[slug];if(!name)notFound();
  let tracks=[];
  if(databaseConfigured())try{
    const canonical=slug.startsWith('ai-')?slug.slice(3):slug;
    const result=await query(`select distinct r.slug,r.title,a.display_name artist from recordings r left join artists a on a.id=r.primary_artist_id left join recording_genres rg on rg.recording_id=r.id left join genres g on g.id=rg.genre_id where r.publication_state='PUBLISHED' and (g.slug=$1 or lower(coalesce(r.primary_genre,''))=lower($2)) order by r.title limit 100`,[canonical,name]);tracks=result.rows;
  }catch(error){console.error('genre_catalogue_read_failed',error?.message||error);}
  const intelligence=genreIntelligence(slug.startsWith('ai-')?slug.slice(3):slug);
  return <main className="detailShell"><section className="detailHero compact"><span className="eyebrow">REGGAEAI GENRE GUIDE + CATALOGUE</span><h1>{slug.startsWith('ai-')&&!name.startsWith('AI ')?`AI ${name}`:name}</h1><p>{descriptionFor(slug,name)}</p></section><section className="detailSection"><div className="sectionHeading"><span className="eyebrow">CURRENT CATALOGUE</span><h2>{tracks.length?`${tracks.length} published`: 'No published tracks yet'}</h2></div><div className="resultGrid">{tracks.map(track=><a className="resultCard" key={track.slug} href={`/music/${track.slug}`}><span className="resultType">track</span><strong>{track.title}</strong><span>{track.artist||'Artist'} →</span></a>)}{!tracks.length?<div className="emptyState"><strong>Catalogue will grow from verified releases.</strong><span>ReggaeAI does not create fake song cards to fill a genre page.</span><a href="/create">Create in {intelligence.label}</a></div>:null}</div></section></main>;
}
