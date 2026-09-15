import { databaseConfigured, query } from '../../lib/db';

export const seedCatalogueRails = [
  {
    title: 'Fresh Outta the Caribbean',
    href: '/genres/ai-reggae',
    items: [
      { title: 'The River Knows My Name', subtitle: 'Aven Indigo · Shot Call Release 001', badge: 'COMING SOON', href: '/music/the-river-knows-my-name' },
      { title: 'Country Reggae', subtitle: 'Caribbean storytelling meets country structure', badge: 'GENRE', href: '/genres/country-reggae' },
      { title: 'AI Kaiso', subtitle: 'Kaiso intelligence, commentary and cadence', badge: 'GENRE', href: '/genres/ai-kaiso' },
      { title: 'AI Steelpan', subtitle: 'Steelpan-led AI music and instrumentals', badge: 'GENRE', href: '/genres/ai-steelpan' }
    ]
  },
  {
    title: 'The Riddim Yard',
    href: '/riddim-yard',
    items: [
      { title: 'Riddims', subtitle: 'One production, many voices', badge: 'PRODUCTION', href: '/riddim-yard' },
      { title: 'Instrumentals', subtitle: 'Caribbean production catalogue', badge: 'PRODUCTION', href: '/riddim-yard' },
      { title: 'Backing Tracks', subtitle: 'Performance-ready production', badge: 'PRODUCTION', href: '/riddim-yard' },
      { title: 'AI Steelpan', subtitle: 'Pan-first instrumental catalogue', badge: 'PRODUCTION', href: '/genres/ai-steelpan' }
    ]
  },
  {
    title: 'Caribbean AI Genres',
    href: '/genres/ai-reggae',
    items: [
      { title: 'AI Reggae', subtitle: 'Roots, modern, lovers rock and dub', badge: 'GENRE', href: '/genres/ai-reggae' },
      { title: 'AI Soca', subtitle: 'Power, groovy and new Caribbean energy', badge: 'GENRE', href: '/genres/ai-soca' },
      { title: 'AI Calypso', subtitle: 'Narrative, satire and Caribbean songcraft', badge: 'GENRE', href: '/genres/ai-calypso' },
      { title: 'AI Extempo', subtitle: 'Improvisational calypso intelligence', badge: 'GENRE', href: '/genres/ai-extempo' }
    ]
  }
];

export async function getCatalogueRails() {
  if (!databaseConfigured()) return { source: 'seed', rails: seedCatalogueRails };

  try {
    const { rows } = await query(`
      select r.slug, r.title, r.primary_genre, r.artwork_url, a.display_name as artist
      from recordings r
      left join artists a on a.id = r.primary_artist_id
      where upper(r.publication_state) = 'PUBLISHED'
      order by r.created_at desc
      limit 12
    `);

    if (!rows.length) return { source: 'database-empty', rails: seedCatalogueRails };

    return {
      source: 'database',
      rails: [{
        title: 'Fresh Outta the Caribbean',
        href: '/music',
        items: rows.map((row) => ({
          title: row.title,
          subtitle: [row.artist, row.primary_genre].filter(Boolean).join(' · '),
          badge: 'RELEASE',
          href: `/music/${row.slug}`,
          artworkUrl: row.artwork_url || null
        }))
      }]
    };
  } catch (error) {
    console.error('catalogue_read_failed', error?.message || error);
    return { source: 'database-error', rails: seedCatalogueRails };
  }
}
