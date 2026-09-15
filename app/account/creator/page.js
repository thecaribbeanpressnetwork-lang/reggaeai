import { evaluateReadiness } from '../../lib/readiness';
import styles from './creator.module.css';

export const metadata = { title: 'Creator | ReggaeAI', robots: { index: false, follow: false } };

const sample = evaluateReadiness({
  audio_state: 'present',
  artwork_state: 'present',
  metadata_state: 'complete',
  rights_state: 'unknown',
  provenance_state: 'unknown',
  credits_state: 'missing',
  catalogue_state: 'unchecked'
});

export default function CreatorPage() {
  return (
    <main className="accountShell">
      <section className="accountHero compact">
        <span className="eyebrow">CREATOR CONTROL</span>
        <h1>One place for claims, imports and release readiness.</h1>
        <p>ReggaeAI keeps creator identity, source provenance and rights evidence separate so a public link never silently becomes an ownership claim.</p>
      </section>

      <section className="accountGrid creatorGrid">
        <article className="accountCard static">
          <span className="accountCardTitle">Artist identity</span>
          <p>Imported profiles can be linked to your account through a claim. Approval requires evidence; source URLs alone are not proof.</p>
          <span className={styles.state}>AUTH REQUIRED</span>
        </article>

        <article className="accountCard static">
          <span className="accountCardTitle">Imports</span>
          <p>One-link and bulk imports remain linked to their provider, canonical source and rights declaration.</p>
          <span className={styles.state}>PROVENANCE PRESERVED</span>
        </article>

        <article className="accountCard static">
          <span className="accountCardTitle">Earnings</span>
          <p>Only verified sales can accrue creator balances. USD payouts are monthly once the available balance reaches US$25.</p>
          <a className={`secondary linkButton ${styles.action}`} href="/account/earnings">View earnings</a>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.head}>
          <div>
            <span className="eyebrow">RELEASE INTELLIGENCE</span>
            <h2>Readiness is evidence-driven.</h2>
          </div>
          <div className={styles.score} aria-label={`Readiness score ${sample.score} percent`}>
            <strong>{sample.score}%</strong>
            <span>{sample.readiness_state.replaceAll('_', ' ')}</span>
          </div>
        </div>

        <div className={styles.grid}>
          {sample.blockers.map((item) => (
            <article className={styles.item} key={item.field}>
              <span>{item.field}</span>
              <strong>{String(item.state).replaceAll('_', ' ')}</strong>
            </article>
          ))}
        </div>

        <p className={styles.note}>This example remains blocked because rights and AI provenance are unresolved. ReggaeAI will never convert a high numerical score into publication approval while a hard blocker remains.</p>
      </section>
    </main>
  );
}
