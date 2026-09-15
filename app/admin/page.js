import '../create/create.css';
import { auth } from '../../auth';
import { adminCapability, isAdminSession } from '../../lib/access';
import { databaseConfigured } from '../../lib/db';
import { trebloConfigured } from '../../lib/providers/treblo';

export const metadata = { title: 'Admin | ReggaeAI', robots: { index: false, follow: false } };

const controls = [
  { title: 'Bulk import', text: 'Resolve 1–50 creator/source links and route exceptions.', href: '/admin/bulk-import' },
  { title: 'Catalogue', text: 'Artists, recordings, releases, riddims, genres and videos.', href: '/admin/catalogue' },
  { title: 'Release intelligence', text: 'Rights, provenance, credits and readiness blockers.', href: '/admin/releases' },
  { title: 'Commerce', text: 'Products, verified transactions, creator balances and payouts.', href: '/admin/commerce' }
];

export default async function AdminPage() {
  const session = await auth();
  const admin = isAdminSession(session);
  const adminState = adminCapability();

  if (!admin) {
    return (
      <main className="accountShell">
        <section className="accountHero compact">
          <span className="eyebrow">FOUNDER CONTROL</span>
          <h1>Admin access is private.</h1>
          <p>{adminState.state === 'TO_CREATE' ? 'The founder-admin account has not yet been configured in the deployment environment.' : 'Sign in with an authorized ReggaeAI admin account.'}</p>
          <div className="accountState">{adminState.state === 'TO_CREATE' ? 'TO CREATE' : 'ADMIN REQUIRED'}</div>
          {!session?.user ? <a className="primary linkButton authAction" href="/signin">Sign in</a> : null}
        </section>
      </main>
    );
  }

  const capability = {
    database: databaseConfigured(),
    treblo: trebloConfigured(),
    wipay: Boolean(process.env.WIPAY_ENV),
    googleAuth: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    controlledStorage: false
  };

  return (
    <main className="accountShell">
      <section className="accountHero compact">
        <span className="eyebrow">FOUNDER CONTROL · REVIEW → APPROVE → COLLECT</span>
        <h1>ReggaeAI operating control.</h1>
        <p>Only exceptions and consequential decisions belong here. Routine discovery, metadata resolution and state calculation should execute underneath.</p>
        <div className="capabilityRow">
          {Object.entries(capability).map(([name, ready]) => <span key={name} data-ready={ready}>{name.replaceAll(/([A-Z])/g,' $1')}</span>)}
        </div>
      </section>
      <section className="accountGrid">
        {controls.map((control) => <a className="accountCard" href={control.href} key={control.title}><span className="accountCardTitle">{control.title}</span><p>{control.text}</p><span className="accountArrow">→</span></a>)}
      </section>
    </main>
  );
}
