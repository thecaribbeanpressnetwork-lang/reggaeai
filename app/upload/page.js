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
        <span className="eyebrow">IMPORT · PROVENANCE · RIGHTS</span>
        <h1>Bring the music in without losing the truth.</h1>
        <p>Paste a supported source link. ReggaeAI resolves public metadata and provenance first. A source link never proves ownership, so hosting and monetization remain separate rights decisions.</p>
        {!session?.user ? <a className="primary linkButton authAction" href="/signin">Sign in to save imports</a> : null}
      </section>

      <section className="importPanel standaloneImport">
        <div>
          <span className="eyebrow">SMART IMPORT</span>
          <h2>One link. Clean provenance.</h2>
          <p>{canPersist ? 'Your authenticated import will be retained in the ReggaeAI catalogue workspace.' : 'Public metadata discovery works now. Sign in when you want ReggaeAI to retain the import in your creator workspace.'}</p>
        </div>
        <ImportForm />
      </section>
    </main>
  );
}
