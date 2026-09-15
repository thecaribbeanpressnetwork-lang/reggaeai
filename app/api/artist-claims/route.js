import { NextResponse } from 'next/server';

export async function POST(request) {
  const databaseReady = Boolean(process.env.DATABASE_URL);
  const authReady = Boolean(process.env.AUTH_PROVIDER && process.env.AUTH_SECRET);

  if (!authReady) {
    return NextResponse.json({
      ok: false,
      state: 'AUTH_REQUIRED',
      message: 'Artist claims are unavailable until the production account provider is connected.'
    }, { status: 503 });
  }

  if (!databaseReady) {
    return NextResponse.json({
      ok: false,
      state: 'DATABASE_REQUIRED',
      message: 'Artist claims are unavailable until persistent storage is connected.'
    }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  if (!body.artist_id || !body.evidence) {
    return NextResponse.json({ ok: false, state: 'INVALID_REQUEST', message: 'artist_id and evidence are required.' }, { status: 400 });
  }

  return NextResponse.json({
    ok: false,
    state: 'NOT_IMPLEMENTED',
    message: 'The authenticated persistence adapter has not been enabled yet.'
  }, { status: 501 });
}
