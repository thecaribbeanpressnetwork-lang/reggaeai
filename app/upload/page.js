import ImportForm from '../components/ImportForm';
import { auth } from '../../auth';
import { databaseConfigured } from '../../lib/db';

export const metadata = {
  title: 'Upload or Import Music | ReggaeAI',
  description: 'Bring authorized Caribbean AI music into ReggaeAI with provenance and rights checks.'
};

export default async function UploadPage() {
  const session = await auth();
  const canPersist = Boolean(session?.user && databaseConfigured());
  return (
    <main className="detailShell">
      <section className="detailHero compact">
        <span className="eyebrow">UPLOAD · IMPORT · PROVENANCE</span>
        <h1>Bring the music in without losing the truth.</h1>
        <p>Start with a supported source link. ReggaeAI resolves public metadata, records provenance and routes unresolved rights or credits into release intelligence. A source link alone never proves ownership.</p>
        <div className="capabilityRow"><span data-ready={Boolean(session?.user)}>Account</span><span data-ready={databaseConfigured()}>Persistent records</span><span data-ready={false}>Direct file storage</span></div>
        {!session?.user ? <a className="primary linkButton authAction" href="/signin">Sign in to persist an import</a> : null}
      </section>
      <section className="importPanel standaloneImport">
        <div><span className="eyebrow">SMART IMPORT</span><h2>One link first.</h2><p>{canPersist ? 'Your account and database are ready to retain creator-side import records.' : 'Metadata discovery works independently; persistent creator records activate when account and database are connected.'}</p></div>
        <ImportForm />
      </section>
      <section className="claimStrip"><div><span className="eyebrow">DIRECT AUDIO / VIDEO</span><strong>Controlled storage required.</strong></div><span>TO CREATE · No fake upload control is shown until founder-controlled storage exists.</span></section>
    </main>
  );
}
