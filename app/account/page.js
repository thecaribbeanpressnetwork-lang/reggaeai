const sections = [
  { title: 'Library', text: 'Saved tracks and purchases will appear here after sign-in.', href: '/account/library' },
  { title: 'Creator', text: 'Imports, artist claims and release status live here.', href: '/account/creator' },
  { title: 'Earnings', text: 'USD balances, statements and monthly payouts.', href: '/account/earnings' }
];

export const metadata = {
  title: 'Account | ReggaeAI',
  robots: { index: false, follow: false }
};

export default function AccountPage() {
  return (
    <main className="accountShell">
      <section className="accountHero">
        <span className="eyebrow">REGGAEAI ACCOUNT</span>
        <h1>Your music. Your rights. One place.</h1>
        <p>Accounts are being connected to the catalogue and commerce layer. Sign-in is intentionally unavailable until the production identity provider is verified.</p>
        <div className="accountState">AUTH PROVIDER · NOT CONNECTED</div>
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
