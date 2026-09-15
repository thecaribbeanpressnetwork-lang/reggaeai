const base = 'https://reggaeai-production-production.up.railway.app';
const genres = [
  'ai-reggae','ai-soca','ai-calypso','ai-kaiso','ai-extempo','ai-steelpan','caribbean-ai-hip-hop','ai-dancehall','country-reggae','roots-reggae'
];

export default function sitemap() {
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/riddim-yard`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    ...genres.map((slug) => ({
      url: `${base}/genres/${slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8
    }))
  ];
}
