import { auth } from '../../../../auth';
import { isAdminSession } from '../../../../lib/access';
import { databaseConfigured, query } from '../../../../lib/db';
import { discoverImport } from '../../../../lib/importers';

function uniqueUrls(values) {
  const seen = new Set();
  return values.filter((value) => {
    const url = String(value || '').trim();
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

async function mapWithConcurrency(values, limit, worker) {
  const results = new Array(values.length);
  let cursor = 0;
  async function run() {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await worker(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, run));
  return results;
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ ok: false, state: 'AUTH_REQUIRED' }, { status: 401 });
  if (!isAdminSession(session)) return Response.json({ ok: false, state: 'ADMIN_REQUIRED' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const urls = uniqueUrls(Array.isArray(body.urls) ? body.urls : String(body.urls || '').split(/\r?\n/)).slice(0, 50);
  if (!urls.length) return Response.json({ ok: false, state: 'INVALID_REQUEST', message: 'Provide 1–50 URLs.' }, { status: 400 });

  const discovered = await mapWithConcurrency(urls, 5, async (url) => {
    try { return await discoverImport(url); }
    catch (error) { return { ok: false, sourceUrl: url, state: 'BLOCKED', error: error?.message || 'Import failed.' }; }
  });

  let persisted = 0;
  if (databaseConfigured()) {
    const userResult = await query('select id from users where email = $1 limit 1', [session.user.email.toLowerCase()]);
    const userId = userResult.rows[0]?.id;
    if (userId) {
      for (const item of discovered.filter((entry) => entry.ok)) {
        const metadata = JSON.stringify(item.metadata || {});
        await query(
          `insert into imports (user_id, source_provider, source_url, canonical_url, provider_item_id, resolved_metadata, state)
           values ($1,$2,$3,$4,$5,$6::jsonb,$7)
           on conflict (source_provider, provider_item_id) do update set
             source_url = excluded.source_url,
             canonical_url = excluded.canonical_url,
             resolved_metadata = excluded.resolved_metadata
           returning id`,
          [userId, item.provider, item.sourceUrl, item.canonicalUrl, item.providerId, metadata, item.state.toLowerCase()]
        );
        persisted += 1;
      }
    }
  }

  const summary = discovered.reduce((acc, item) => {
    if (!item.ok) acc.failed += 1;
    else if (item.state === 'DISCOVERED') acc.readyForReview += 1;
    else acc.needsReview += 1;
    return acc;
  }, { readyForReview: 0, needsReview: 0, failed: 0 });

  return Response.json({
    ok: true,
    state: databaseConfigured() ? 'DISCOVERED' : 'DISCOVERED_NOT_PERSISTED',
    total: discovered.length,
    persisted,
    summary,
    items: discovered,
    note: 'Discovery does not confer hosting, ownership or monetization rights.'
  });
}
