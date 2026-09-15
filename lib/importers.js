function decodeHtml(value = '') {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function meta(html, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const pattern of [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, 'i')
  ]) {
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

export function detectProvider(url) {
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

export function providerId(provider, canonicalUrl) {
  if (!canonicalUrl) return null;
  try {
    const parsed = new URL(canonicalUrl);
    if (provider === 'suno') return parsed.pathname.match(/\/song\/([a-f0-9-]{20,})/i)?.[1] || null;
    return null;
  } catch {
    return null;
  }
}

export async function resolvePublicMetadata(sourceUrl) {
  const response = await fetch(sourceUrl, {
    redirect: 'follow',
    cache: 'no-store',
    headers: { 'user-agent': 'ReggaeAI-Importer/1.0 (+https://reggaeai-live-production.up.railway.app)' },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return { resolvedUrl: response.url, metadata: null };
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

export async function discoverImport(sourceUrl) {
  const provider = detectProvider(sourceUrl);
  if (!provider) return { ok: false, state: 'BLOCKED', error: 'Enter a valid song URL.' };

  let resolution = null;
  let resolutionError = null;
  try { resolution = await resolvePublicMetadata(sourceUrl); }
  catch (error) { resolutionError = error instanceof Error ? error.message : 'Unable to resolve public metadata.'; }

  const canonicalUrl = resolution?.canonicalUrl || resolution?.resolvedUrl || sourceUrl;
  const id = providerId(provider, canonicalUrl);
  const hasMetadata = Boolean(resolution?.metadata?.title || resolution?.metadata?.artworkUrl);

  return {
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
  };
}
