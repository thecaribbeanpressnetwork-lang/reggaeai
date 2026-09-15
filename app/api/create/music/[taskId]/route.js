import { auth } from '../../../../../auth';
import { databaseConfigured, query } from '../../../../../lib/db';
import { getTrebloGeneration, getTrebloStatus, mapTrebloState, trebloConfigured } from '../../../../../lib/providers/treblo';

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

    if (providerStatus === 'SUCCESS') {
      const generation = await getTrebloGeneration(taskId);
      output = generation || {};
      await query('update ai_jobs set state = $1, output = $2::jsonb, updated_at = now() where id = $3', [state, JSON.stringify(output), job.id]);

      const songPaths = Array.isArray(generation?.song_paths) ? generation.song_paths : [];
      for (const sourceUrl of songPaths) {
        await query(
          `insert into media_assets (owner_user_id, ai_job_id, media_type, source_provider, source_url, provenance, storage_state, publication_eligible)
           values ($1,$2,'audio','treblo',$3,$4::jsonb,'external_temporary',false)
           on conflict (ai_job_id, source_url) where ai_job_id is not null and source_url is not null do nothing`,
          [userId, job.id, sourceUrl, JSON.stringify({ provider: 'treblo', providerJobId: taskId, generatedAt: generation?.created_at || null })]
        );
      }
    } else {
      await query('update ai_jobs set state = $1, updated_at = now() where id = $2', [state, job.id]);
    }

    return Response.json({
      ok: true,
      state: state.toUpperCase(),
      providerStatus,
      jobId: job.id,
      songPaths: state === 'succeeded' && Array.isArray(output?.song_paths) ? output.song_paths : [],
      storageState: state === 'succeeded' ? 'EXTERNAL_TEMPORARY' : null,
      publicationEligible: false,
      nextAction: state === 'succeeded' ? 'Copy accepted output to controlled ReggaeAI storage before publication.' : 'Continue polling real provider status.'
    });
  } catch (error) {
    console.error('music_generation_status_failed', error?.message || error);
    return Response.json({ ok: false, state: 'BLOCKED', message: 'Generation status could not be verified.' }, { status: 502 });
  }
}
