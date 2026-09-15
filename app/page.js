import ImportForm from './components/ImportForm';
import MusicRail from './components/MusicRail';
import { getCatalogueRails } from './lib/catalogue';

function Wordmark() {
  return <span className="wordmark"><span className="wordmarkReggae">REGGAE</span><span className="wordmarkAi">AI</span></span>;
}

export default async function Home() {
  const catalogue = await getCatalogueRails();

  return (
    <main>
      <section className="hero" id="discover">
        <div className="heroCopy">
          <span className="eyebrow">CARIBBEAN AI MUSIC · BUILT IN THE CARIBBEAN</span>
          <h1>The islands are<br/><em>creating next.</em></h1>
          <p>Discover Caribbean AI music, follow the riddims and productions behind the records, create new work and publish with clear provenance instead of anonymous AI clutter.</p>
          <div className="heroActions">
            <a className="primary linkButton" href="#catalogue">Discover music</a>
            <a className="secondary linkButton" href="/create">Create with ReggaeAI</a>
          </div>
        </div>
        <div className="brandCrest" aria-label="ReggaeAI original winged lion emblem">
          <img src="/reggaeai-lion.svg" alt="ReggaeAI winged lion emblem" className="heroLion" />
          <Wordmark />
          <span className="brandLine">CARIBBEAN SOUND · FUTURE INTELLIGENCE</span>
        </div>
      </section>

      <section className="platformBand" aria-label="ReggaeAI platform pillars">
        <a href="/search"><span>01</span><strong>Discover</strong><small>Caribbean-first catalogue and search</small></a>
        <a href="/riddim-yard"><span>02</span><strong>Trace</strong><small>Riddims, productions and versions</small></a>
        <a href="/create"><span>03</span><strong>Create</strong><small>Native AI music with provenance</small></a>
        <a href="/upload"><span>04</span><strong>Own</strong><small>Import, claim, license and earn</small></a>
      </section>

      <section className="importPanel" id="upload">
        <div>
          <span className="eyebrow">ONE-LINK IMPORT</span>
          <h2>Your track should arrive with its story intact.</h2>
          <p>Paste a supported Suno, Treblo or other AI-music link. ReggaeAI resolves public metadata and provenance, then asks you to confirm rights before anything is hosted or monetized.</p>
        </div>
        <ImportForm />
      </section>

      <div className="content" id="catalogue" data-catalogue-source={catalogue.source}>
        {catalogue.rails.map((rail) => <MusicRail key={rail.title} {...rail} />)}
      </div>

      <footer>
        <div className="footerBrand"><img src="/reggaeai-lion.svg" alt=""/><Wordmark /></div>
        <span>Discovery · Creation · Riddim intelligence · Licensing · Caribbean provenance</span>
      </footer>
    </main>
  );
}
