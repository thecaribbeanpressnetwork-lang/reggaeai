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
      <section className="hero reggaeTextureEdge" id="discover">
        <div className="heroCopy">
          <span className="eyebrow">CARIBBEAN SOUND · FUTURE INTELLIGENCE</span>
          <h1>Music first.<br/><em>Caribbean always.</em></h1>
          <p>Discover Caribbean records, trace the riddims and productions behind them, create new work and keep the rights and provenance attached to the music.</p>
          <div className="heroActions">
            <a className="primary linkButton" href="#catalogue">Discover music</a>
            <a className="secondary linkButton" href="/create">Enter the studio</a>
          </div>
        </div>
        <div className="brandCrest" aria-label="ReggaeAI original winged lion emblem">
          <img src="/reggaeai-lion.svg" alt="ReggaeAI winged lion emblem" className="heroLion" />
          <Wordmark />
          <span className="brandLine">THE CARIBBEAN MUSIC PLATFORM BUILT FOR WHAT COMES NEXT</span>
        </div>
      </section>

      <section className="platformBand" aria-label="ReggaeAI platform pillars">
        <a href="/search"><span>01</span><strong>Discover</strong><small>Artists, releases, genres and Caribbean sound</small></a>
        <a href="/riddim-yard"><span>02</span><strong>Riddim Yard</strong><small>Productions, versions and instrumental lineage</small></a>
        <a href="/create"><span>03</span><strong>Create</strong><small>Generate real music with Caribbean direction</small></a>
        <a href="/upload"><span>04</span><strong>Import</strong><small>Bring in music with provenance intact</small></a>
      </section>

      <div className="content" id="catalogue" data-catalogue-source={catalogue.source}>
        {catalogue.rails.map((rail) => <MusicRail key={rail.title} {...rail} />)}
      </div>

      <section className="importPanel reggaeTextureBand" id="upload">
        <div>
          <span className="eyebrow">ONE-LINK IMPORT</span>
          <h2>Bring your music in without losing its story.</h2>
          <p>Paste a supported Suno, Treblo or other AI-music link. ReggaeAI resolves public metadata and provenance, then keeps ownership and monetization behind explicit rights gates.</p>
        </div>
        <ImportForm />
      </section>

      <footer>
        <div className="footerBrand"><img src="/reggaeai-lion.svg" alt=""/><Wordmark /></div>
        <span>Music · Riddims · Creation · Rights · Caribbean provenance</span>
      </footer>
    </main>
  );
}
