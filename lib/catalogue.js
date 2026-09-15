import { databaseConfigured, query } from './db';

export const seedRails = [
  {
    title: 'Fresh Outta the Caribbean',
    items: [
      { title: 'The River Knows My Name', subtitle: 'Aven Indigo · Country Reggae', state: 'catalogued' },
      { title: 'Midnight Cane Riddim', subtitle: 'Riddim Yard · Production', state: 'catalogued' },
      { title: 'Steelpan After Dark', subtitle: 'AI Steelpan · Instrumental', state: 'catalogued' },
      { title: 'Kaiso 2040', subtitle: 'Kaiso · AI Original', state: 'catalogued' }
    ]
  },
  {
    title: 'Reggae Right Now',
    items: [
      { title: 'Country Reggae', subtitle: 'Genre collection', state: 'collection' },
      { title: 'Roots & Dub', subtitle: 'Genre collection', state: 'collection' },
      { title: 'Lovers Rock', subtitle: 'Genre collection', state: 'collection' },
      { title: 'Modern Reggae', subtitle: 'Genre collection', state: 'collection' }
    ]
  },
  {
    title: 'The Riddim Yard',
    items: [
      { title: 'Midnight Cane Riddim', subtitle: 'Riddim · 76 BPM', state: 'catalogued' },
      { title: 'Savannah Dust', subtitle: 'Riddim · 82 BPM', state: 'catalogued' },
      { title: 'Port of Spain Bounce', subtitle: 'Production', state: 'catalogued' },
      { title: 'Island Ember', subtitle: 'Instrumental', state: 'catalogued' }
    ]
  }
];

export async function getHomeRails() {
  if (!databaseConfigured()) return { source: 'seed', rails: seedRails };

  try {
    const result = await query(`
      select r.title, a.name as artist, r.primary_genre
      from recordings r
      left join artists a on a.id = r.artist_id
      where r.publication_state = 'PUBLISHED'
      order by r.created_at desc
      limit 12
    `);

    if (!result.rows.length) return { source: 'database-empty', rails: seedRails };

    const items = result.rows.map((row) => ({
      title: row.title,
      subtitle: [row.artist, row.primary_genre].filter(Boolean).join(' · '),
      state: 'published'
    }));

    return {
      source: 'database',
      rails: [{ title: 'Fresh Outta the Caribbean', items }]
    };
  } catch (error) {
    console.error('catalogue_read_failed', error?.message || error);
    return { source: 'database-error', rails: seedRails };
  }
}
