export const metadata = { title: 'Library | ReggaeAI', robots: { index: false, follow: false } };

export default function LibraryPage() {
  return (
    <main className="accountShell">
      <section className="accountHero compact">
        <span className="eyebrow">YOUR LIBRARY</span>
        <h1>Saved and purchased music.</h1>
        <p>Library data is account-scoped. It remains empty until production authentication is connected.</p>
      </section>
      <section className="emptyState"><strong>No signed-in library yet.</strong><span>Public catalogue browsing does not require an account.</span><a href="/">Browse ReggaeAI</a></section>
    </main>
  );
}
