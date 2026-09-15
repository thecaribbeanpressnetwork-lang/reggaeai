export default function MusicRail({ title, href, items }) {
  return (
    <section className="rail" aria-labelledby={`rail-${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}>
      <div className="railHeader">
        <h2 id={`rail-${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}>{title}</h2>
        <a href={href}>See all</a>
      </div>
      <div className="cards">
        {items.map((item, index) => (
          <a className="card" href={item.href} key={`${item.title}-${index}`}>
            <div className={`art ${item.artworkUrl ? 'hasArtwork' : 'typeArtwork'}`} aria-hidden="true">
              {item.artworkUrl ? <img src={item.artworkUrl} alt="" /> : <><span>{item.badge}</span><strong>{item.title}</strong></>}
            </div>
            <div className="cardCopy">
              <strong>{item.title}</strong>
              <small>{item.subtitle}</small>
            </div>
            <span className="cardArrow" aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}
