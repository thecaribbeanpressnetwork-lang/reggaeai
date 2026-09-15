export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://reggaeai-live-production.up.railway.app';
  return {
    rules: [
      { userAgent: '*', allow: ['/', '/search', '/artists/', '/music/', '/releases/', '/riddims/', '/riddim-yard', '/genres/'], disallow: ['/account/', '/admin/', '/api/'] }
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base
  };
}
