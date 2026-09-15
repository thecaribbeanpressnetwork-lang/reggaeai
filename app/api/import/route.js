import { auth } from '../../../auth';
import { databaseConfigured, query } from '../../../lib/db';
import { discoverImport } from '../../../lib/importers';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const sourceUrl = typeof body?.url === 'string' ? body.url.trim() : '';
  const result = await discoverImport(sourceUrl);
  if (!result.ok) return Response.json(result, { status: 400 });

  const session = await auth();
  let persisted = false;
  let importId = null;

  if (session?.user?.email && databaseConfigured()) {
    try {
      const userResult = await query('select id from users where email = $1 limit 1', [session.user.email.toLowerCase()]);
      const userId = userResult.rows[0]?.id;
      if (userId) {
        const metadata = JSON.stringify(result.metadata || {});
        const providerItemId = result.providerId || null;
        let stored;
        if (providerItemId) {
          stored = await query(
            `insert into imports (user_id, source_provider, source_url, canonical_url, provider_item_id, resolved_metadata, state)
             values ($1,$2,$3,$4,$5,$6::jsonb,$7)
             on conflict (source_provider, provider_item_id) do update set
               user_id = excluded.user_id,
               source_url = excluded.source_url,
               canonical_url = excluded.canonical_url,
               resolved_metadata = excluded.resolved_metadata
             returning id`,
            [userId, result.provider, result.sourceUrl, result.canonicalUrl, providerItemId, metadata, result.state.toLowerCase()]
          );
        } else {
          stored = await query(
            `insert into imports (user_id, source_provider, source_url, canonical_url, provider_item_id, resolved_metadata, state)
             select $1,$2,$3,$4,null,$5::jsonb,$6
             where not exists (select 1 from imports where user_id = $1 and coalesce(canonical_url, source_url) = coalesce($4, $3))
             returning id`,
            [userId, result.provider, result.sourceUrl, result.canonicalUrl, metadata, result.state.toLowerCase()]
          );
        }
        persisted = Boolean(stored.rows[0]?.id);
        importId = stored.rows[0]?.id || null;
      }
    } catch (error) {
      console.error('import_persist_failed', error?.message || error);
    }
  }

  return Response.json({ ...result, persisted, importId, accountState: session?.user ? 'AUTHENTICATED' : 'ANONYMOUS' });
}
