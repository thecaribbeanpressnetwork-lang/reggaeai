export const metadata = { title: 'Creator | ReggaeAI', robots: { index: false, follow: false } };

export default function CreatorPage() {
  return (
    <main className="accountShell">
      <section className="accountHero compact">
        <span className="eyebrow">CREATOR CONTROL</span>
        <h1>Imports, claims and release readiness.</h1>
        <p>Creator tools will attach to the same account as listening and purchases. Artist profiles imported before registration can be claimed instead of duplicated.</p>
      </section>
      <section className="accountGrid creatorGrid">
        <article className="accountCard static"><span className="accountCardTitle">Imports</span><p>One-link and bulk imports will appear here with truth-gated rights states.</p><span className="accountState small">ACCOUNT REQUIRED</span></article>
        <article className="accountCard static"><span className="accountCardTitle">Claim artist</span><p>Claim an existing profile using source and ownership evidence.</p><span className="accountState small">VERIFICATION REQUIRED</span></article>
        <article className="accountCard static"><span className="accountCardTitle">Release readiness</span><p>Metadata, provenance, credits and rights exceptions will be surfaced here.</p><span className="accountState small">SHOT CALL INTELLIGENCE</span></article>
      </section>
    </main>
  );
}
