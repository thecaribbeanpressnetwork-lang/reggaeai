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

function decodeHtml(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function meta(html, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, 'i')
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1].trim());
  }
  return null;
}

function canonicalFromHtml(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return match?.[1] || null;
}

function providerId(provider, canonicalUrl) {
  if (!canonicalUrl) return null;
  try {
    const parsed = new URL(canonicalUrl);
    if (provider === 'suno') {
      const match = parsed.pathname.match(/\/song\/([a-f0-9-]{20,})/i);
      return match?.[1] || null;
    }
    return null;
  } catch {
    return null;
  }
}

async function resolvePublicMetadata(sourceUrl) {
  const response = await fetch(sourceUrl, {
    redirect: 'follow',
    cache: 'no-store',
    headers: {
      'user-agent': 'ReggaeAI-Importer/1.0 (+https://reggaeai-production-production.up.railway.app)'
    },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return { resolvedUrl: response.url, metadata: null };
  }

  const html = await response.text();
  const canonicalUrl = canonicalFromHtml(html) || response.url;
  return {
    resolvedUrl: response.url,
    canonicalUrl,
    metadata: {
      title: meta(html, 'og:title') || meta(html, 'twitter:title') || null,
      description: meta(html, 'og:description') || meta(html, 'description') || null,
      artworkUrl: meta(html, 'og:image') || meta(html, 'twitter:image') || null,
      pageType: meta(html, 'og:type') || null
    }
  };
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const sourceUrl = typeof body?.url === 'string' ? body.url.trim() : '';
  const provider = detectProvider(sourceUrl);

  if (!provider) {
    return Response.json({ ok: false, state: 'BLOCKED', error: 'Enter a valid song URL.' }, { status: 400 });
  }

  let resolution = null;
  let resolutionError = null;
  try {
    resolution = await resolvePublicMetadata(sourceUrl);
  } catch (error) {
    resolutionError = error instanceof Error ? error.message : 'Unable to resolve public metadata.';
  }

  const canonicalUrl = resolution?.canonicalUrl || resolution?.resolvedUrl || sourceUrl;
  const id = providerId(provider, canonicalUrl);
  const hasMetadata = Boolean(resolution?.metadata?.title || resolution?.metadata?.artworkUrl);

  return Response.json({
    ok: true,
    state: hasMetadata ? 'DISCOVERED' : 'DISCOVERED_NEEDS_REVIEW',
    provider,
    providerId: id,
    sourceUrl,
    resolvedUrl: resolution?.resolvedUrl || null,
    canonicalUrl,
    metadata: resolution?.metadata || null,
    resolutionError,
    hosted: false,
    monetizable: false,
    rightsConfirmed: false,
    nextAction: 'Confirm creator identity and rights before ReggaeAI hosts, monetizes or republishes audio.'
  });
}
