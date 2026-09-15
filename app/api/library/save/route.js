import { auth } from '../../../../auth';
import { databaseConfigured, query } from '../../../../lib/db';

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ ok:false, state:'AUTH_REQUIRED' }, { status:401 });
  if (!databaseConfigured()) return Response.json({ ok:false, state:'DATABASE_REQUIRED' }, { status:503 });

  const body = await request.json().catch(() => ({}));
  const type = body?.type === 'riddim' ? 'riddim' : 'track';
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
  if (!slug) return Response.json({ ok:false, state:'INVALID_REQUEST', message:'Missing catalogue item.' }, { status:400 });

  try {
    const userResult = await query('select id from users where email=$1 limit 1', [session.user.email.toLowerCase()]);
    const userId = userResult.rows[0]?.id;
    if (!userId) return Response.json({ ok:false, state:'ACCOUNT_NOT_PERSISTED' }, { status:409 });

    if (type === 'track') {
      const item = await query("select id from recordings where slug=$1 and publication_state='PUBLISHED' limit 1", [slug]);
      const recordingId = item.rows[0]?.id;
      if (!recordingId) return Response.json({ ok:false, state:'ITEM_NOT_FOUND' }, { status:404 });
      await query(`insert into saved_items (user_id,recording_id)
                   select $1,$2 where not exists (
                     select 1 from saved_items where user_id=$1 and recording_id=$2
                   )`, [userId, recordingId]);
    } else {
      const item = await query("select id from productions where slug=$1 and publication_state='published' limit 1", [slug]);
      const productionId = item.rows[0]?.id;
      if (!productionId) return Response.json({ ok:false, state:'ITEM_NOT_FOUND' }, { status:404 });
      await query(`insert into saved_items (user_id,production_id)
                   select $1,$2 where not exists (
                     select 1 from saved_items where user_id=$1 and production_id=$2
                   )`, [userId, productionId]);
    }

    return Response.json({ ok:true, state:'SAVED' });
  } catch (error) {
    console.error('library_save_failed', error?.message || error);
    return Response.json({ ok:false, state:'BLOCKED', message:'The item could not be saved.' }, { status:500 });
  }
}
