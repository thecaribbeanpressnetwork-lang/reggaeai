import ImportForm from './components/ImportForm';
import MusicRail from './components/MusicRail';
import { getCatalogueRails } from './lib/catalogue';

function Wordmark() {
  return <span className="wordmark"><span className="wordmarkReggae">REGGAE</span><span className="wordmarkAi">AI</span></span>;
}

export default async function Home() {
  const catalogue = await getCatalogueRails();

  return (
    <main className="homeStage">
      <section className="featureHero" id="discover">
        <div className="featureTexture" aria-hidden="true" />
        <div className="featureCopy">
          <span className="eyebrow">FEATURED RECORD · COUNTRY REGGAE</span>
          <p className="featureKicker">AVEN INDIGO</p>
          <h1>The River<br/>Knows My Name</h1>
          <p className="featureDeck">A reflective Caribbean country-reggae record from Shot Call Records. ReggaeAI presents the music first, with provenance and rights intelligence underneath instead of turning the experience into an AI dashboard.</p>
          <div className="heroActions">
            <a className="primary linkButton" href="/music/the-river-knows-my-name">Open record</a>
            <a className="secondary linkButton" href="/artists/aven-indigo">Meet Aven Indigo</a>
          </div>
          <div className="featureMeta" aria-label="Featured release facts">
            <span><b>03:24</b> duration</span>
            <span><b>AI PERSONA</b> transparent provenance</span>
            <span><b>TRINIDAD & TOBAGO</b> label origin</span>
          </div>
        </div>
        <a className="featureCover" href="/music/the-river-knows-my-name" aria-label="Open The River Knows My Name by Aven Indigo">
          <div className="coverFrame">
            <div className="coverTexture" />
            <span className="coverArtist">AVEN INDIGO</span>
            <div className="coverTitle">THE RIVER<br/>KNOWS<br/>MY NAME</div>
            <span className="coverGenre">COUNTRY REGGAE</span>
          </div>
          <div className="coverCaption"><span>Shot Call Records</span><span>Featured release →</span></div>
        </a>
      </section>

      <section className="cultureBar" aria-label="Caribbean music platform">
        <div><strong>REGGAEAI</strong><span>Caribbean music lives here.</span></div>
        <nav>
          <a href="/genres/roots-reggae">Roots</a>
          <a href="/genres/country-reggae">Country Reggae</a>
          <a href="/genres/soca">Soca</a>
          <a href="/genres/calypso">Calypso</a>
          <a href="/genres/dancehall">Dancehall</a>
          <a href="/riddim-yard">Riddims</a>
        </nav>
      </section>

      <div className="content musicFloor" id="catalogue" data-catalogue-source={catalogue.source}>
        <header className="floorIntro">
          <span className="eyebrow">DISCOVER</span>
          <h2>Records, riddims and Caribbean sound.</h2>
          <p>Browse the catalogue like a record wall, not a software dashboard.</p>
        </header>
        {catalogue.rails.map((rail) => <MusicRail key={rail.title} {...rail} />)}
      </div>

      <section className="studioSplit">
        <div className="studioStory">
          <span className="eyebrow">CREATE</span>
          <h2>Enter the studio.<br/><em>Leave with music.</em></h2>
          <p>Caribbean direction, genre intelligence and real generation tools without sci-fi theatre.</p>
          <a className="primary linkButton" href="/create">Open the studio</a>
        </div>
        <div className="importPanel reggaeTextureBand" id="upload">
          <div>
            <span className="eyebrow">BRING YOUR MUSIC</span>
            <h2>Keep the story attached to the song.</h2>
            <p>Paste a supported Suno, Treblo or other source link. ReggaeAI resolves public metadata, then keeps ownership and monetization behind explicit rights gates.</p>
          </div>
          <ImportForm />
        </div>
      </section>

      <footer>
        <div className="footerBrand"><img src="/reggaeai-lion.svg" alt=""/><Wordmark /></div>
        <span>Music first · Caribbean always · Technology underneath</span>
      </footer>
    </main>
  );
}
