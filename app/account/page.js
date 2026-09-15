import { auth, signOut } from '../../auth';

const sections = [
  { title: 'Library', text: 'Saved tracks, purchases and licences.', href: '/account/library' },
  { title: 'Creator', text: 'Imports, artist claims and release readiness.', href: '/account/creator' },
  { title: 'Earnings', text: 'USD balances, statements and monthly payouts.', href: '/account/earnings' }
];

export const metadata = {
  title: 'Account | ReggaeAI',
  robots: { index: false, follow: false }
};

export default async function AccountPage() {
  const session = await auth();

  return (
    <main className="accountShell">
      <section className="accountHero">
        <span className="eyebrow">REGGAEAI ACCOUNT</span>
        <h1>{session?.user ? `Welcome, ${session.user.name || 'creator'}.` : 'Your music. Your rights. One place.'}</h1>
        <p>{session?.user ? 'Your listener, creator, purchase and earnings identity is connected through one account.' : 'Public discovery remains open. Sign in only when you need private library, creator, purchase or earnings functions.'}</p>
        {session?.user ? (
          <div className="accountIdentity">
            {session.user.image ? <img src={session.user.image} alt="" /> : null}
            <div><strong>{session.user.name || session.user.email}</strong><span>{session.user.email}</span></div>
            <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}><button className="secondary" type="submit">Sign out</button></form>
          </div>
        ) : (
          <a className="primary linkButton authAction" href="/signin">Sign in</a>
        )}
      </section>

      <section className="accountGrid">
        {sections.map((section) => (
          <a key={section.title} href={section.href} className="accountCard">
            <span className="accountCardTitle">{section.title}</span>
            <p>{section.text}</p>
            <span className="accountArrow">→</span>
          </a>
        ))}
      </section>
    </main>
  );
}
