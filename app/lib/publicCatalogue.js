import { databaseConfigured, query } from '../../lib/db';

const genreSeeds = [
  ['ai-reggae','AI Reggae'],['ai-soca','AI Soca'],['ai-calypso','AI Calypso'],['ai-kaiso','AI Kaiso'],['ai-extempo','AI Extempo'],['ai-steelpan','AI Steelpan'],['ai-dancehall','AI Dancehall'],['country-reggae','Country Reggae'],['roots-reggae','Roots Reggae'],['caribbean-ai-hip-hop','Caribbean AI Hip Hop']
].map(([slug,name]) => ({ type: 'genre', slug, name, href: `/genres/${slug}` }));

const seedArtist = { id:'seed-aven-indigo', slug:'aven-indigo', displayName:'Aven Indigo', artistType:'ai_persona', bio:'A fictional AI artist persona developed transparently for ReggaeAI and Shot Call Records. No human biography is asserted.', region:null, verified:false, provenanceState:'DECIDED' };
const seedRecording = { id:'seed-river', slug:'the-river-knows-my-name', title:'The River Knows My Name', artist:seedArtist, primaryGenre:'Country Reggae', labelName:'Shot Call Records', artworkUrl:null, audioUrl:null, durationSeconds:203.96, rightsState:'TO VERIFY', publicationState:'COMING SOON', aiProvenance:{}, isrcState:'RESERVED_NOT_ASSIGNED_TO_ACCEPTED_MASTER' };
const seedProduction = { id:'seed-midnight-cane', slug:'midnight-cane-riddim', title:'Midnight Cane Riddim', productionType:'riddim', bpm:null, musicalKey:null, rightsState:'DEMO_METADATA_ONLY', songs:[] };

export async function getPublicArtist(slug) {
  if (databaseConfigured()) try {
    const artist = await query("select id,slug,display_name,artist_type,bio,region,verified from artists where slug=$1 and profile_state='published' limit 1",[slug]);
    if (artist.rows[0]) {
      const tracks = await query("select slug,title,primary_genre,artwork_url,audio_url,publication_state from recordings where primary_artist_id=$1 and publication_state='PUBLISHED' order by created_at desc",[artist.rows[0].id]);
      return {...artist.rows[0],displayName:artist.rows[0].display_name,artistType:artist.rows[0].artist_type,tracks:tracks.rows};
    }
  } catch(error){console.error('public_artist_read_failed',error?.message||error);}
  return slug===seedArtist.slug?{...seedArtist,tracks:[seedRecording]}:null;
}

export async function getPublicRecording(slug) {
  if (databaseConfigured()) try {
    const result=await query(`select r.*,a.slug artist_slug,a.display_name artist_name,a.artist_type,rel.slug release_slug,rel.title release_title,rel.label_name from recordings r left join artists a on a.id=r.primary_artist_id left join release_tracks rt on rt.recording_id=r.id left join releases rel on rel.id=rt.release_id where r.slug=$1 and r.publication_state='PUBLISHED' limit 1`,[slug]);
    if(result.rows[0]){const row=result.rows[0];return {...row,artist:{slug:row.artist_slug,displayName:row.artist_name,artistType:row.artist_type},labelName:row.label_name};}
  } catch(error){console.error('public_recording_read_failed',error?.message||error);}
  return slug===seedRecording.slug?seedRecording:null;
}

export async function getPublicProduction(slug) {
  if(databaseConfigured()) try {
    const result=await query("select p.*,a.display_name producer_name,a.slug producer_slug from productions p left join artists a on a.id=p.producer_artist_id where p.slug=$1 and p.publication_state='published' limit 1",[slug]);
    if(result.rows[0]){const songs=await query("select r.slug,r.title,a.display_name artist_name,a.slug artist_slug from recordings r left join artists a on a.id=r.primary_artist_id where r.production_id=$1 and r.publication_state='PUBLISHED' order by r.created_at",[result.rows[0].id]);return {...result.rows[0],songs:songs.rows};}
  } catch(error){console.error('public_production_read_failed',error?.message||error);}
  return slug===seedProduction.slug?seedProduction:null;
}

export async function getPublicRelease(slug) {
  if(!databaseConfigured())return null;
  try{const release=await query("select rel.*,a.display_name artist_name,a.slug artist_slug from releases rel left join artists a on a.id=rel.primary_artist_id where rel.slug=$1 and rel.publication_state='PUBLISHED' limit 1",[slug]);if(!release.rows[0])return null;const tracks=await query("select r.slug,r.title,rt.track_number,rt.disc_number from release_tracks rt join recordings r on r.id=rt.recording_id where rt.release_id=$1 and r.publication_state='PUBLISHED' order by rt.disc_number,rt.track_number",[release.rows[0].id]);return {...release.rows[0],tracks:tracks.rows};}catch(error){console.error('public_release_read_failed',error?.message||error);return null;}
}

export async function searchPublicCatalogue(rawQuery){const q=String(rawQuery||'').trim();if(!q)return[];const needle=q.toLowerCase();if(databaseConfigured())try{const like=`%${q}%`;const[artists,tracks,productions,releases]=await Promise.all([
query("select 'artist' type,slug,display_name name from artists where profile_state='published' and display_name ilike $1 order by display_name limit 8",[like]),
query("select 'track' type,slug,title name from recordings where publication_state='PUBLISHED' and title ilike $1 order by created_at desc limit 8",[like]),
query("select 'riddim' type,slug,title name from productions where publication_state='published' and title ilike $1 order by created_at desc limit 8",[like]),
query("select 'release' type,slug,title name from releases where publication_state='PUBLISHED' and title ilike $1 order by release_date desc nulls last limit 8",[like])]);return[...artists.rows,...tracks.rows,...productions.rows,...releases.rows].map(item=>({...item,href:item.type==='artist'?`/artists/${item.slug}`:item.type==='track'?`/music/${item.slug}`:item.type==='riddim'?`/riddims/${item.slug}`:`/releases/${item.slug}`}));}catch(error){console.error('public_search_failed',error?.message||error);}
  const seeds=[{type:'artist',slug:seedArtist.slug,name:seedArtist.displayName,href:`/artists/${seedArtist.slug}`},{type:'track',slug:seedRecording.slug,name:seedRecording.title,href:`/music/${seedRecording.slug}`},{type:'riddim',slug:seedProduction.slug,name:seedProduction.title,href:`/riddims/${seedProduction.slug}`},...genreSeeds];return seeds.filter(item=>item.name.toLowerCase().includes(needle));
}

export {genreSeeds,seedArtist,seedRecording,seedProduction};
