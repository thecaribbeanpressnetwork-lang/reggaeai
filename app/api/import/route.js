import { discoverImport } from '../../../lib/importers';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const sourceUrl = typeof body?.url === 'string' ? body.url.trim() : '';
  const result = await discoverImport(sourceUrl);
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
