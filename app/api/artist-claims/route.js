import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { databaseConfigured, query } from '../../../lib/db';

export async function POST(request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({
      ok: false,
      state: 'AUTH_REQUIRED',
      message: 'Sign in before submitting an artist claim.'
    }, { status: 401 });
  }

  if (!databaseConfigured()) {
    return NextResponse.json({
      ok: false,
      state: 'DATABASE_REQUIRED',
      message: 'Artist claims are unavailable until persistent storage is connected.'
    }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const evidence = String(body.evidence || '').trim();
  const artistId = String(body.artist_id || '').trim();

  if (!artistId || evidence.length < 12) {
    return NextResponse.json({
      ok: false,
      state: 'INVALID_REQUEST',
      message: 'artist_id and meaningful ownership evidence are required.'
    }, { status: 400 });
  }

  try {
    const userResult = await query('select id from users where email = $1 limit 1', [session.user.email.toLowerCase()]);
    const userId = userResult.rows[0]?.id;
    if (!userId) {
      return NextResponse.json({ ok: false, state: 'ACCOUNT_NOT_PERSISTED' }, { status: 409 });
    }

    const artistResult = await query('select id, display_name from artists where id = $1 limit 1', [artistId]);
    if (!artistResult.rows[0]) {
      return NextResponse.json({ ok: false, state: 'ARTIST_NOT_FOUND' }, { status: 404 });
    }

    const inserted = await query(
      `insert into artist_claims (user_id, artist_id, evidence, status)
       values ($1,$2,$3,'submitted')
       returning id, status, created_at`,
      [userId, artistId, evidence]
    );

    return NextResponse.json({
      ok: true,
      state: 'SUBMITTED',
      claim: inserted.rows[0],
      artist: artistResult.rows[0],
      message: 'Claim submitted for evidence review. Submission does not itself prove ownership.'
    }, { status: 202 });
  } catch (error) {
    console.error('artist_claim_submit_failed', error?.message || error);
    return NextResponse.json({ ok: false, state: 'BLOCKED', message: 'Claim could not be stored.' }, { status: 500 });
  }
}
