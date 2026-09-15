const rails = [
  ['Fresh Outta the Caribbean', ['The River Knows My Name', 'Midnight Cane Riddim', 'Steelpan After Dark', 'Kaiso 2040']],
  ['Reggae Right Now', ['Country Reggae', 'Roots & Dub', 'Lovers Rock', 'Modern Reggae']],
  ['The Riddim Yard', ['Midnight Cane Riddim', 'Savannah Dust', 'Port of Spain Bounce', 'Island Ember']],
  ['Caribbean AI Music Videos', ['River Visual', 'Neon Savannah', 'Steel & Smoke', 'Kingston Signal']]
];

function Rail({ title, items }) {
  return (
    <section className="rail">
      <div className="railHeader"><h2>{title}</h2><button>See all</button></div>
      <div className="cards">
        {items.map((item, index) => (
          <article className="card" key={item}>
            <div className="art"><span>{String(index + 1).padStart(2, '0')}</span></div>
            <div className="cardCopy"><strong>{item}</strong><small>ReggaeAI catalogue</small></div>
            <button className="play" aria-label={`Play ${item}`}>▶</button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#">REGGAE<span>AI</span></a>
        <nav>
          <a href="#discover">Discover</a><a href="#search">Search</a><a href="#riddim">Riddim Yard</a><a href="#create">Create</a><a href="#library">Library</a><a href="#upload">Upload</a>
        </nav>
        <button className="account">Sign in</button>
      </header>

      <section className="hero" id="discover">
        <div className="heroTexture" />
        <div className="heroCopy">
          <p className="eyebrow">CARIBBEAN AI MUSIC · BUILT IN THE CARIBBEAN</p>
          <h1>The islands are<br/><em>creating next.</em></h1>
          <p>Discover new Caribbean AI music, trace the riddims behind the records, create your own sound and publish with clear provenance.</p>
          <div className="heroActions"><button className="primary">Start listening</button><button className="secondary">+ Create</button></div>
        </div>
        <div className="lionMark" aria-label="ReggaeAI winged lion brand mark"><div className="wing leftWing"/><div className="lion">RAI</div><div className="wing rightWing"/></div>
      </section>

      <section className="importPanel" id="upload">
        <div><span className="eyebrow">ONE-LINK IMPORT</span><h2>Bring your AI song into ReggaeAI.</h2><p>Paste a supported Suno, Treblo or other AI-music link. ReggaeAI resolves the metadata, provenance and catalogue draft; you confirm rights before publication.</p></div>
        <form><input aria-label="Song link" placeholder="https://suno.com/s/..."/><button type="button" className="primary">Import song</button></form>
      </section>

      <div className="content">
        {rails.map(([title, items]) => <Rail key={title} title={title} items={items}/>) }
      </div>

      <footer><strong>ReggaeAI</strong><span>Discovery · Creation · Licensing · Caribbean music intelligence</span></footer>

      <div className="player">
        <div className="miniArt"/><div className="track"><strong>Ready to play</strong><small>Select a track from the catalogue</small></div>
        <button>⏮</button><button className="playerPlay">▶</button><button>⏭</button><div className="progress"><span/></div><button>♡</button>
      </div>
    </main>
  );
}
