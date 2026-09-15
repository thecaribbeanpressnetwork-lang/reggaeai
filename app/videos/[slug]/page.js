import { notFound } from 'next/navigation';
import { databaseConfigured, query } from '../../../lib/db';

export async function generateMetadata({params}){const{slug}=await params;if(!databaseConfigured())return{title:'Video | ReggaeAI'};try{const r=await query("select title from videos where slug=$1 and publication_state='PUBLISHED' limit 1",[slug]);return r.rows[0]?{title:`${r.rows[0].title} | ReggaeAI`}:{title:'Video not found | ReggaeAI'};}catch{return{title:'Video | ReggaeAI'}}}

export default async function VideoPage({params}){
  const{slug}=await params;if(!databaseConfigured())notFound();
  const result=await query(`select v.*,a.display_name artist_name,a.slug artist_slug,r.title track_title,r.slug track_slug from videos v left join artists a on a.id=v.artist_id left join recordings r on r.id=v.recording_id where v.slug=$1 and v.publication_state='PUBLISHED' limit 1`,[slug]).catch(()=>({rows:[]}));
  const video=result.rows[0];if(!video)notFound();
  return <main className="detailShell"><section className="detailHero compact"><span className="eyebrow">AI MUSIC VIDEO · PUBLISHED</span><h1>{video.title}</h1><div className="factRow">{video.artist_name?<span>{video.artist_name}</span>:null}{video.track_title?<span>{video.track_title}</span>:null}<span>Rights: {String(video.rights_state).replaceAll('_',' ')}</span>{video.source_provider?<span>Provider: {video.source_provider}</span>:null}</div></section><section className="detailSection">{video.video_url?<video className="videoPlayer" controls preload="metadata" poster={video.poster_url||undefined} src={video.video_url}/>:<div className="emptyState"><strong>Video file unavailable.</strong><span>The catalogue record exists, but ReggaeAI will not fabricate playback.</span></div>}</section></main>;
}
