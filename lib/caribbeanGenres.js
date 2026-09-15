const catalogue = {
  'calypso': { label: 'Calypso', prompt: 'Trinidad and Tobago calypso: narrative songcraft, witty topical storytelling, clear lead vocal, chorus response where appropriate, Caribbean rhythmic lift; avoid generic tropical-pop clichés.' },
  'kaiso': { label: 'Kaiso', prompt: 'Kaiso rooted in Trinidad and Tobago calypso tradition: lyric-forward commentary, memorable refrain, conversational phrasing, rhythmic storytelling; preserve a distinctly Trinidadian cultural frame without caricature.' },
  'extempo': { label: 'Extempo', prompt: 'Trinidad and Tobago extempo approach: improvised-feeling lyrical delivery, responsive refrain, verbal agility, topical wit and competitive call-and-response energy; do not write it as generic rap.' },
  'santimanitay': { label: 'Santimanitay', prompt: 'Santimanitay-informed extempo/Kalinda challenge refrain energy: sharp call-and-response, escalating verbal challenge, memorable recurring refrain and Trinidadian oral-performance character; no violence glorification.' },
  'lavway': { label: 'Lavway / Lavwé', prompt: 'Lavway/Lavwé inspired by Trinidad and Tobago Kalinda stickfight chant tradition: chantwell-led call-and-response, communal chorus, drum-forward pulse, declarative vocal phrases and live-circle energy; treat as cultural tradition, not generic festival chanting.' },
  'steelpan': { label: 'Steelpan', prompt: 'Steelpan-centered Caribbean arrangement with realistic pan-range interplay, rhythmic clarity and space for melodic steel voices; avoid synthetic mallet clichés that do not resemble pan ensemble phrasing.' },
  'ai-steelpan': { label: 'AI Steelpan', prompt: 'Steelpan-forward instrumental designed for AI generation: realistic steelpan phrasing, complementary bass/percussion, clear melodic arcs, Caribbean groove and uncluttered frequency space for pan voices.' },
  'reggae': { label: 'Reggae', prompt: 'Reggae foundation with convincing offbeat guitar/keyboard skank, bass-led groove, pocketed drums and dub-aware space; avoid generic pop-reggae gloss unless requested.' },
  'roots-reggae': { label: 'Roots Reggae', prompt: 'Roots reggae: deep bass, one-drop or roots-informed drum pocket, restrained skank, organ/piano support, spacious arrangement, grounded vocal delivery and dub-ready transitions.' },
  'modern-reggae': { label: 'Modern Reggae', prompt: 'Modern reggae production retaining authentic reggae rhythmic grammar while allowing contemporary low end, vocal production and cinematic texture.' },
  'country-reggae': { label: 'Country Reggae', prompt: 'Country-reggae fusion: reggae rhythmic pocket and bass foundation fused with country storytelling, acoustic/steel-guitar colors and singable narrative melody; neither side should collapse into generic pop.' },
  'dancehall': { label: 'Dancehall', prompt: 'Dancehall: syncopated riddim focus, strong drum programming, bass pressure, economical harmony and vocal space; keep the groove Caribbean rather than generic trap.' },
  'dub': { label: 'Dub', prompt: 'Dub-informed reggae production: strong bass/drums, negative space, delay/reverb throws, dropouts and version-style arrangement; effects should serve groove rather than wash out the mix.' },
  'lovers-rock': { label: 'Lovers Rock', prompt: 'Lovers rock: smooth reggae pocket, warm bass, romantic melodic focus, polished harmonies and restrained arrangement.' },
  'rocksteady': { label: 'Rocksteady', prompt: 'Rocksteady-inspired slower Jamaican groove, warm bass movement, relaxed offbeat accompaniment, vocal harmony and vintage restraint.' },
  'ska': { label: 'Ska', prompt: 'Ska-informed upbeat Jamaican rhythm with energetic offbeat guitar/piano, walking or melodic bass and horn-friendly rhythmic punctuation.' },
  'mento': { label: 'Mento', prompt: 'Mento-informed Jamaican acoustic folk character with light rhythmic drive, storytelling vocal feel and period-aware instrumentation without novelty caricature.' },
  'soca': { label: 'Soca', prompt: 'Trinidad and Tobago soca foundation: forward rhythmic drive, strong bassline, carnival-scale hook architecture and kinetic percussion; keep the groove recognizably soca rather than EDM-pop.' },
  'power-soca': { label: 'Power Soca', prompt: 'Power soca: high-energy Trinidad and Tobago carnival drive, commanding drums, urgent bass, chant-ready hook and road-scale momentum.' },
  'groovy-soca': { label: 'Groovy Soca', prompt: 'Groovy soca: midtempo Trinidad and Tobago soca pocket, warm rolling bass, melodic hook, sensual rhythmic movement and clean percussion detail.' },
  'chutney': { label: 'Chutney', prompt: 'Indo-Caribbean chutney character with rhythmic vocal storytelling and culturally appropriate melodic/percussive colors; avoid generic Bollywood imitation.' },
  'chutney-soca': { label: 'Chutney Soca', prompt: 'Chutney soca fusion: Indo-Caribbean melodic/percussive character integrated with soca drive and carnival-ready hook structure.' },
  'dennery-segment': { label: 'Dennery Segment', prompt: 'Saint Lucian Dennery Segment-informed energy: sparse aggressive rhythmic architecture, repetitive hook logic, percussive urgency and raw dancefloor momentum; avoid smoothing it into generic soca.' },
  'bouyon': { label: 'Bouyon', prompt: 'Dominican bouyon-informed groove: highly rhythmic layered percussion, driving bass and repetitive kinetic hooks with live-band urgency.' },
  'kompa': { label: 'Kompa', prompt: 'Haitian kompa-informed dance groove: steady pulse, melodic bass/guitar interplay, polished band feel and elegant forward motion.' },
  'zouk': { label: 'Zouk', prompt: 'French Caribbean zouk-informed dance production with fluid groove, melodic bass, polished synth/guitar textures and romantic rhythmic flow.' },
  'caribbean-gospel': { label: 'Caribbean Gospel', prompt: 'Caribbean gospel: spiritually focused songwriting with Caribbean rhythmic language, strong ensemble vocals and culturally grounded instrumentation.' },
  'caribbean-rnb': { label: 'Caribbean R&B', prompt: 'Contemporary R&B songwriting with authentic Caribbean rhythmic and melodic influence rather than superficial island effects.' },
  'caribbean-hip-hop': { label: 'Caribbean Hip Hop', prompt: 'Hip-hop production grounded in Caribbean rhythmic identity, language cadence and regional musical references without defaulting to American trap templates.' },
  'caribbean-rap': { label: 'Caribbean Rap', prompt: 'Rap with Caribbean cadence, rhythmic intelligence and regional sonic vocabulary; keep lyrical space clear and avoid forced accent mimicry.' },
  'afro-caribbean': { label: 'Afro-Caribbean', prompt: 'Afro-Caribbean fusion built from compatible rhythmic lineages, layered percussion and bass movement; preserve Caribbean identity rather than using a generic Afrobeats preset.' },
  'island-pop': { label: 'Island Pop', prompt: 'Accessible Caribbean pop with clean hooks and regional rhythmic identity; avoid tourism-ad clichés and ukulele-by-default production.' },
  'caribbean-fusion': { label: 'Caribbean Fusion', prompt: 'Caribbean fusion: combine the requested styles only where their rhythmic and harmonic roles are compatible; preserve identifiable Caribbean rhythmic grammar and avoid genre soup.' },
  'instrumental': { label: 'Instrumental', prompt: 'Instrumental arrangement with clear sections, memorable motifs and enough dynamic development to stand without vocals.' },
  'riddim': { label: 'Riddim', prompt: 'Vocal-ready Caribbean riddim: strong repeatable production identity, space for multiple artists, clear intro/verse/hook sections and minimal melodic clutter competing with future vocals.' },
  'beat': { label: 'Beat', prompt: 'Artist-ready beat with a distinct identity, clear arrangement markers, vocal space and commercially useful structure.' },
  'backing-track': { label: 'Backing Track', prompt: 'Performance-ready backing track with stable tempo, clear song form, supportive arrangement and no lead element that competes with a live vocalist.' },
  'production-version': { label: 'Production / Version', prompt: 'Version-style production emphasizing the underlying arrangement and riddim identity, suitable for alternate vocals, dub treatment or performance use.' }
};

export function normalizeGenre(value = '') {
  return String(value).trim().toLowerCase().replace(/&/g, 'and').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function genreIntelligence(value) {
  const key = normalizeGenre(value);
  return catalogue[key] || { label: String(value || 'Caribbean music').trim() || 'Caribbean music', prompt: 'Caribbean-first music production with culturally coherent rhythm, instrumentation and phrasing. Avoid generic tropical clichés.' };
}

export function enrichMusicPrompt({ prompt, genre, mode = 'song' }) {
  const intelligence = genreIntelligence(genre);
  const purpose = mode === 'riddim' || mode === 'beat'
    ? 'Create a production designed to support future vocalists; prioritize groove, identity and vocal space.'
    : 'Create a complete song with a memorable structure, coherent dynamics and performance-ready arrangement.';
  return `${intelligence.prompt}\n${purpose}\nCreator direction: ${String(prompt || '').trim()}`.trim();
}

export const caribbeanGenreOptions = Object.entries(catalogue).map(([slug, item]) => ({ slug, label: item.label }));
