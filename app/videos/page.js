import { databaseConfigured, query } from '../../lib/db';

export const metadata = { title: 'Caribbean AI Music Videos | ReggaeAI', description: 'Published Caribbean AI music videos with transparent provenance on ReggaeAI.' };

export default async function VideosPage(){
  let videos=[];
  if(databaseConfigured()) try{const result=await query(`select v.slug,v.title,v.poster_url,a.display_name artist from videos v left join artists a on a.id=v.artist_id where v.publication_state='PUBLISHED' order by v.created_at desc limit 100`);videos=result.rows;}catch(error){console.error('videos_read_failed',error?.message||error);}
  return <main className="detailShell"><section className="detailHero compact"><span className="eyebrow">CARIBBEAN AI MUSIC VIDEOS</span><h1>Visuals with provenance.</h1><p>Only published videos with an authorized catalogue record appear here. Generation-provider availability is separate from video hosting and display.</p></section><section className="resultGrid">{videos.map(v=><a className="resultCard" href={`/videos/${v.slug}`} key={v.slug}><span className="resultType">video</span><strong>{v.title}</strong><span>{v.artist||'Artist'} →</span></a>)}{!videos.length?<div className="emptyState"><strong>No published videos yet.</strong><span>ReggaeAI will not seed fake video cards just to make the catalogue look full.</span></div>:null}</section></main>;
}
