import { auth } from '../../../../../auth';
import { isAdminSession } from '../../../../../lib/access';
import { databaseConfigured, query } from '../../../../../lib/db';

function slugify(value){return String(value||'track').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,72)||'track';}

export async function POST(request){
  const session=await auth();
  if(!session?.user?.email)return Response.json({ok:false,state:'AUTH_REQUIRED'},{status:401});
  if(!isAdminSession(session))return Response.json({ok:false,state:'ADMIN_REQUIRED'},{status:403});
  if(!databaseConfigured())return Response.json({ok:false,state:'DATABASE_REQUIRED'},{status:503});

  const body=await request.json().catch(()=>({}));
  const importId=String(body.importId||'').trim();
  if(!importId)return Response.json({ok:false,state:'INVALID_REQUEST',message:'importId is required.'},{status:400});

  try{
    const existing=await query("select id,slug,title from recordings where ai_provenance->>'sourceImportId'=$1 limit 1",[importId]);
    if(existing.rows[0])return Response.json({ok:true,state:'ALREADY_CATALOGUED',recording:existing.rows[0]});

    const imported=await query('select * from imports where id=$1 limit 1',[importId]);
    const item=imported.rows[0];
    if(!item)return Response.json({ok:false,state:'IMPORT_NOT_FOUND'},{status:404});
    if(!item.rights_confirmed)return Response.json({ok:false,state:'RIGHTS_CONFIRMATION_REQUIRED',message:'Creator rights attestation is required before catalogue promotion.'},{status:409});

    const metadata=item.resolved_metadata||{};
    const title=String(metadata.title||'').trim();
    if(!title)return Response.json({ok:false,state:'METADATA_REQUIRED',message:'A resolved title is required before creating a catalogue draft.'},{status:409});

    const suffix=String(importId).replace(/-/g,'').slice(0,8);
    const slug=`${slugify(title)}-${suffix}`;
    const provenance=JSON.stringify({sourceImportId:importId,sourceProvider:item.source_provider,sourceUrl:item.canonical_url||item.source_url,creatorRightsAttested:true,promotedAt:new Date().toISOString()});
    const inserted=await query(`insert into recordings (slug,title,primary_artist_id,artwork_url,ai_provenance,rights_state,publication_state) values ($1,$2,$3,$4,$5::jsonb,'creator_attested','draft') returning id,slug,title,publication_state,rights_state`,[slug,title,item.artist_id||null,metadata.artworkUrl||null,provenance]);
    const recording=inserted.rows[0];

    const blockers=['accepted_master_required','credits_required','provenance_review_required'];
    if(!item.artist_id)blockers.push('artist_assignment_required');
    if(!metadata.artworkUrl)blockers.push('artwork_required');
    await query(`insert into release_readiness (recording_id,audio_state,artwork_state,metadata_state,rights_state,provenance_state,credits_state,catalogue_state,readiness_state,score,blockers) values ($1,'missing',$2,'partial','creator_attested','source_recorded','missing','unchecked','approval_required',25,$3::jsonb) on conflict (recording_id) do nothing`,[recording.id,metadata.artworkUrl?'discovered':'missing',JSON.stringify(blockers)]);
    await query("update imports set state='catalogued' where id=$1",[importId]);

    return Response.json({ok:true,state:'DRAFT_CREATED',recording,note:'Catalogue draft created. Publication, hosting and monetization remain blocked until release gates are completed.'},{status:201});
  }catch(error){
    console.error('import_promote_failed',error?.message||error);
    return Response.json({ok:false,state:'BLOCKED',message:'Import could not be promoted to the catalogue.'},{status:500});
  }
}
