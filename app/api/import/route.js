function detectProvider(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'suno.com') return 'suno';
    if (host === 'treblo.com') return 'treblo';
    return 'generic';
  } catch {
    return null;
  }
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const sourceUrl = typeof body?.url === 'string' ? body.url.trim() : '';
  const provider = detectProvider(sourceUrl);

  if (!provider) {
    return Response.json({ ok: false, state: 'BLOCKED', error: 'Enter a valid song URL.' }, { status: 400 });
  }

  return Response.json({
    ok: true,
    state: 'DISCOVERED',
    provider,
    sourceUrl,
    hosted: false,
    monetizable: false,
    rightsConfirmed: false,
    nextAction: 'Provider resolver and rights confirmation required before publication.'
  });
}
