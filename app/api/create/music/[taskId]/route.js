import { auth } from '../../../../../auth';
import { databaseConfigured, query } from '../../../../../lib/db';
import { getTrebloGeneration, getTrebloStatus, mapTrebloState, trebloConfigured } from '../../../../../lib/providers/treblo';
import { copyRemoteToGoogleDrive, googleDriveConfigured } from '../../../../../lib/storage/googleDrive';

export async function GET(_request, { params }) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ ok: false, state: 'AUTH_REQUIRED' }, { status: 401 });
  if (!databaseConfigured()) return Response.json({ ok: false, state: 'DATABASE_REQUIRED' }, { status: 503 });
  if (!trebloConfigured()) return Response.json({ ok: false, state: 'PROVIDER_REQUIRED', provider: 'treblo' }, { status: 503 });

  const { taskId } = await params;
  try {
    const owner = await query('select id from users where email = $1 limit 1', [session.user.email.toLowerCase()]);
    const userId = owner.rows[0]?.id;
    const jobResult = await query("select * from ai_jobs where provider = 'treblo' and provider_job_id = $1 and user_id = $2 limit 1", [taskId, userId]);
    const job = jobResult.rows[0];
    if (!job) return Response.json({ ok: false, state: 'JOB_NOT_FOUND' }, { status: 404 });

    const providerStatus = await getTrebloStatus(taskId);
    const state = mapTrebloState(providerStatus);
    let output = job.output || {};
    const storageResults = [];

    if (providerStatus === 'SUCCESS') {
      const generation = await getTrebloGeneration(taskId);
      output = generation || {};
      await query('update ai_jobs set state = $1, output = $2::jsonb, updated_at = now() where id = $3', [state, JSON.stringify(output), job.id]);

      const songPaths = Array.isArray(generation?.song_paths) ? generation.song_paths : [];
      for (let index=0; index<songPaths.length; index += 1) {
        const sourceUrl = songPaths[index];
        await query(
          `insert into media_assets (owner_user_id, ai_job_id, media_type, source_provider, source_url, provenance, storage_state, publication_eligible)
           values ($1,$2,'audio','treblo',$3,$4::jsonb,'external_temporary',false)
           on conflict (ai_job_id, source_url) where ai_job_id is not null and source_url is not null do nothing`,
          [userId, job.id, sourceUrl, JSON.stringify({ provider: 'treblo', providerJobId: taskId, generatedAt: generation?.created_at || null })]
        );
        const assetResult = await query('select id,storage_state,storage_key from media_assets where ai_job_id=$1 and source_url=$2 limit 1',[job.id,sourceUrl]);
        const asset=assetResult.rows[0];
        if(asset?.storage_state==='controlled'&&asset?.storage_key){storageResults.push({sourceUrl,state:'CONTROLLED',fileId:asset.storage_key});continue;}
        if(!googleDriveConfigured()){storageResults.push({sourceUrl,state:'OAUTH_REQUIRED'});continue;}
        try{
          await query("update media_assets set storage_state='copy_pending',updated_at=now() where id=$1",[asset.id]);
          const stored=await copyRemoteToGoogleDrive({sourceUrl,mediaType:'audio',appProperties:{provider:'treblo',providerJobId:taskId,variant:String(index+1)}});
          await query(`update media_assets set storage_provider='google_drive',storage_key=$1,controlled_url=$2,bytes=$3,mime_type=$4,storage_state='controlled',updated_at=now() where id=$5`,[stored.fileId,stored.webViewLink,stored.bytes,stored.mimeType,asset.id]);
          storageResults.push({sourceUrl,state:'CONTROLLED',fileId:stored.fileId});
        }catch(storageError){
          console.error('treblo_drive_copy_failed',storageError?.message||storageError);
          await query("update media_assets set storage_state='external_temporary',updated_at=now() where id=$1",[asset.id]);
          storageResults.push({sourceUrl,state:'COPY_FAILED'});
        }
      }
    } else {
      await query('update ai_jobs set state = $1, updated_at = now() where id = $2', [state, job.id]);
    }

    const allControlled=state==='succeeded'&&storageResults.length>0&&storageResults.every(item=>item.state==='CONTROLLED');
    return Response.json({
      ok: true,
      state: state.toUpperCase(),
      providerStatus,
      jobId: job.id,
      songPaths: state === 'succeeded' && Array.isArray(output?.song_paths) ? output.song_paths : [],
      storageState: state === 'succeeded' ? (allControlled?'CONTROLLED_GOOGLE_DRIVE':'EXTERNAL_TEMPORARY') : null,
      storageResults,
      publicationEligible: false,
      nextAction: state === 'succeeded' ? (allControlled?'Controlled copy secured. Complete rights/provenance gates before publication.':'Connect Google Drive OAuth or retry controlled copy before publication.') : 'Continue polling real provider status.'
    });
  } catch (error) {
    console.error('music_generation_status_failed', error?.message || error);
    return Response.json({ ok: false, state: 'BLOCKED', message: 'Generation status could not be verified.' }, { status: 502 });
  }
}
