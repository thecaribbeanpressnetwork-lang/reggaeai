export const metadata = {
  title: 'The Riddim Yard — Caribbean Riddims, Beats & Instrumentals',
  description: 'Discover Caribbean riddims, beats, instrumentals and productions, then trace the songs voiced on each production.'
};

const productions = [
  { title: 'Midnight Cane Riddim', producer: 'ReggaeAI Demo Producer', genre: 'Roots Reggae', bpm: 74, key: 'D minor', songs: ['River Road', 'Under Cane Sky'] },
  { title: 'Savannah Dust', producer: 'ReggaeAI Demo Producer', genre: 'Country Reggae', bpm: 82, key: 'G major', songs: ['Long Way Home'] },
  { title: 'Port of Spain Bounce', producer: 'ReggaeAI Demo Producer', genre: 'Caribbean Hip Hop', bpm: 96, key: 'F minor', songs: ['City Lights'] }
];

export default function RiddimYard() {
  return (
    <main className="content" style={{paddingTop:48}}>
      <p className="eyebrow">THE RIDDIM YARD</p>
      <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(2.8rem,7vw,6rem)',margin:'10px 0'}}>The production behind the record.</h1>
      <p style={{maxWidth:760,color:'#bfb6a8',lineHeight:1.7}}>Browse riddims, beats, instrumentals and backing tracks as first-class Caribbean catalogue objects. Each production can connect to every song recorded or voiced on it.</p>
      <div className="cards" style={{marginTop:36}}>
        {productions.map((item) => (
          <article className="card" key={item.title}>
            <div className="art"><span>{item.bpm} BPM</span></div>
            <div className="cardCopy" style={{paddingRight:14}}>
              <strong>{item.title}</strong>
              <small>{item.genre} · {item.key}</small>
              <small>Producer: {item.producer}</small>
              <small>Voiced on this riddim: {item.songs.join(' · ')}</small>
            </div>
          </article>
        ))}
      </div>
      <p style={{marginTop:40}}><a className="secondary linkButton" href="/">← Back to Discover</a></p>
    </main>
  );
}
