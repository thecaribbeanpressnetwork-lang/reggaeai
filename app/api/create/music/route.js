import { auth } from '../../../../auth';
import { databaseConfigured, query } from '../../../../lib/db';
import { enrichMusicPrompt } from '../../../../lib/caribbeanGenres';
import { startTrebloGeneration, trebloConfigured } from '../../../../lib/providers/treblo';

const allowedModes = new Set(['song','riddim','beat']);

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ ok: false, state: 'AUTH_REQUIRED' }, { status: 401 });
  if (!databaseConfigured()) return Response.json({ ok: false, state: 'DATABASE_REQUIRED', message: 'Persistent job logging is required before generation.' }, { status: 503 });
  if (!trebloConfigured()) return Response.json({ ok: false, state: 'PROVIDER_REQUIRED', provider: 'treblo' }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const prompt = String(body.prompt || '').trim();
  const genre = String(body.genre || '').trim();
  const mode = allowedModes.has(body.mode) ? body.mode : 'song';

  if (prompt.length < 8 || !genre) {
    return Response.json({ ok: false, state: 'INVALID_REQUEST', message: 'Choose a genre and provide a meaningful creative direction.' }, { status: 400 });
  }

  try {
    const userResult = await query('select id from users where email = $1 limit 1', [session.user.email.toLowerCase()]);
    const userId = userResult.rows[0]?.id;
    if (!userId) return Response.json({ ok: false, state: 'ACCOUNT_NOT_PERSISTED' }, { status: 409 });

    const enrichedPrompt = enrichMusicPrompt({ prompt, genre, mode });
    const provider = await startTrebloGeneration({ prompt: enrichedPrompt });
    const input = JSON.stringify({ mode, genre, creatorPrompt: prompt, enrichedPrompt });

    const inserted = await query(
      `insert into ai_jobs (user_id, job_type, provider, provider_job_id, state, input)
       values ($1,$2,'treblo',$3,'submitted',$4::jsonb)
       returning id, provider_job_id, state, created_at`,
      [userId, mode === 'song' ? 'song' : 'riddim', provider.task_id, input]
    );

    return Response.json({
      ok: true,
      state: 'SUBMITTED',
      job: inserted.rows[0],
      provider: 'treblo',
      note: 'Generation is real. Publication remains blocked until output is copied to controlled storage and rights/provenance gates pass.'
    }, { status: 202 });
  } catch (error) {
    console.error('music_generation_submit_failed', error?.message || error);
    return Response.json({ ok: false, state: 'BLOCKED', message: 'Generation could not be submitted.' }, { status: 502 });
  }
}
