import '../../create/create.css';
import BulkImportForm from '../../components/BulkImportForm';
import { auth } from '../../../auth';
import { isAdminSession } from '../../../lib/access';
import { databaseConfigured } from '../../../lib/db';

export const metadata = { title: 'Bulk Import | ReggaeAI Admin', robots: { index: false, follow: false } };

export default async function BulkImportPage() {
  const session = await auth();
  const admin = isAdminSession(session);
  if (!admin) return <main className="accountShell"><section className="accountHero compact"><span className="eyebrow">FOUNDER CONTROL</span><h1>Admin required.</h1><p>This tool can create catalogue evidence records and is restricted to configured ReggaeAI administrators.</p><div className="accountState">ADMIN REQUIRED</div></section></main>;

  return (
    <main className="detailShell">
      <section className="detailHero compact">
        <span className="eyebrow">BULK IMPORT · 1–50 LINKS</span>
        <h1>Resolve the catalogue. Handle only exceptions.</h1>
        <p>ReggaeAI follows supported public links, extracts legitimately exposed metadata, deduplicates by provider identity where possible, and never treats a source URL as proof of ownership.</p>
        <div className="capabilityRow"><span data-ready={databaseConfigured()}>Persistent database</span><span data-ready="true">Public metadata discovery</span></div>
      </section>
      <section className="createPrimary adminTool"><BulkImportForm enabled={true} /></section>
    </main>
  );
}
