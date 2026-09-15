import { databaseConfigured, query } from '../lib/db';

const genres = [
  'ai-reggae','ai-soca','ai-calypso','ai-kaiso','ai-extempo','ai-steelpan','caribbean-ai-hip-hop','ai-dancehall','country-reggae','roots-reggae'
];

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://reggaeai-live-production.up.railway.app';
  const now = new Date();
  const entries = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/riddim-yard`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/artists/aven-indigo`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/music/the-river-knows-my-name`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/riddims/midnight-cane-riddim`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    ...genres.map((slug) => ({ url: `${base}/genres/${slug}`, lastModified: now, changeFrequency: 'daily', priority: 0.8 }))
  ];

  if (!databaseConfigured()) return entries;

  try {
    const [artists, tracks, releases, productions] = await Promise.all([
      query('select slug, updated_at from artists order by updated_at desc limit 5000'),
      query("select slug, updated_at from recordings where publication_state = 'PUBLISHED' order by updated_at desc limit 10000"),
      query("select slug, updated_at from releases where publication_state = 'PUBLISHED' order by updated_at desc limit 5000"),
      query('select slug, created_at from productions order by created_at desc limit 5000')
    ]);
    entries.push(
      ...artists.rows.map((r) => ({ url: `${base}/artists/${r.slug}`, lastModified: r.updated_at || now, changeFrequency: 'weekly', priority: 0.7 })),
      ...tracks.rows.map((r) => ({ url: `${base}/music/${r.slug}`, lastModified: r.updated_at || now, changeFrequency: 'weekly', priority: 0.8 })),
      ...releases.rows.map((r) => ({ url: `${base}/releases/${r.slug}`, lastModified: r.updated_at || now, changeFrequency: 'weekly', priority: 0.8 })),
      ...productions.rows.map((r) => ({ url: `${base}/riddims/${r.slug}`, lastModified: r.created_at || now, changeFrequency: 'weekly', priority: 0.7 }))
    );
  } catch (error) {
    console.error('sitemap_database_read_failed', error?.message || error);
  }

  return entries;
}
