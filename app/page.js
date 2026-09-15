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
        <div className="heroTexture" />
        <div className="heroCopy">
          <span className="eyebrow">CARIBBEAN AI MUSIC · BUILT IN THE CARIBBEAN</span>
          <h1>The islands are<br/><em>creating next.</em></h1>
          <p>Discover Caribbean AI music, trace the riddims behind the records, create your own sound and publish with clear provenance.</p>
          <div className="heroActions">
            <a className="primary linkButton" href="#catalogue">Explore the catalogue</a>
            <a className="secondary linkButton" href="/upload">Import a song</a>
          </div>
        </div>
        <div className="brandCrest" aria-label="ReggaeAI original winged lion emblem">
          <img src="/reggaeai-lion.svg" alt="ReggaeAI winged lion emblem" className="heroLion" />
          <Wordmark />
          <span className="brandLine">CARIBBEAN SOUND · FUTURE INTELLIGENCE</span>
        </div>
      </section>

      <section className="importPanel" id="upload">
        <div>
          <span className="eyebrow">ONE-LINK IMPORT</span>
          <h2>Bring your AI song into ReggaeAI.</h2>
          <p>Paste a supported Suno, Treblo or other AI-music link. ReggaeAI resolves public metadata and provenance; you confirm rights before anything is hosted or monetized.</p>
        </div>
        <ImportForm />
      </section>

      <div className="content" id="catalogue" data-catalogue-source={catalogue.source}>
        {catalogue.rails.map((rail) => <MusicRail key={rail.title} {...rail} />)}
      </div>

      <footer>
        <div className="footerBrand"><img src="/reggaeai-lion.svg" alt=""/><Wordmark /></div>
        <span>Discovery · Creation · Licensing · Caribbean music intelligence</span>
      </footer>
    </main>
  );
}
