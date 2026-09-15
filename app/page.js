import ImportForm from './components/ImportForm';

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

function Wordmark() {
  return <span className="wordmark"><span className="wordmarkReggae">REGGAE</span><span className="wordmarkAi">AI</span></span>;
}

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#discover" aria-label="ReggaeAI home">
          <img src="/reggaeai-lion.svg" alt="" className="brandIcon" />
          <Wordmark />
        </a>
        <nav>
          <a href="#discover">Discover</a><a href="#search">Search</a><a href="/riddim-yard">Riddim Yard</a><a href="#create">Create</a><a href="#library">Library</a><a href="#upload">Upload</a>
        </nav>
        <button className="account">Sign in</button>
      </header>

      <section className="hero" id="discover">
        <div className="heroTexture" />
        <div className="heroCopy">
          <div className="heroBrand"><span className="eyebrow">CARIBBEAN AI MUSIC · BUILT IN THE CARIBBEAN</span></div>
          <h1>The islands are<br/><em>creating next.</em></h1>
          <p>Discover new Caribbean AI music, trace the riddims behind the records, create your own sound and publish with clear provenance.</p>
          <div className="heroActions"><a className="primary linkButton" href="#catalogue">Start listening</a><a className="secondary linkButton" href="#upload">+ Create</a></div>
        </div>
        <div className="brandCrest" aria-label="ReggaeAI original winged lion emblem">
          <img src="/reggaeai-lion.svg" alt="ReggaeAI winged lion emblem" className="heroLion" />
          <Wordmark />
          <span className="brandLine">CARIBBEAN SOUND · FUTURE INTELLIGENCE</span>
        </div>
      </section>

      <section className="importPanel" id="upload">
        <div><span className="eyebrow">ONE-LINK IMPORT</span><h2>Bring your AI song into ReggaeAI.</h2><p>Paste a supported Suno, Treblo or other AI-music link. ReggaeAI resolves the metadata, provenance and catalogue draft; you confirm rights before publication.</p></div>
        <ImportForm />
      </section>

      <div className="content" id="catalogue">
        {rails.map(([title, items]) => <Rail key={title} title={title} items={items}/>) }
      </div>

      <footer><div className="footerBrand"><img src="/reggaeai-lion.svg" alt=""/><Wordmark /></div><span>Discovery · Creation · Licensing · Caribbean music intelligence</span></footer>

      <div className="player">
        <div className="miniArt"/><div className="track"><strong>Ready to play</strong><small>Select a track from the catalogue</small></div>
        <button>⏮</button><button className="playerPlay">▶</button><button>⏭</button><div className="progress"><span/></div><button>♡</button>
      </div>
    </main>
  );
}
