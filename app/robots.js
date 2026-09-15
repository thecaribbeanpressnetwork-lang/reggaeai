export default function robots() {
  const base = 'https://reggaeai-production-production.up.railway.app';
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${base}/sitemap.xml`,
    host: base
  };
}
