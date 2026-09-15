import { authCapability, signIn } from '../../auth';

export const metadata = { title: 'Sign in | ReggaeAI', robots: { index: false, follow: false } };

export default function SignInPage() {
  const capability = authCapability();

  return (
    <main className="accountShell">
      <section className="accountHero compact">
        <span className="eyebrow">REGGAEAI ACCOUNT</span>
        <h1>One account. Listening, creating and getting paid.</h1>
        <p>Public music stays open. An account is only required for saving, importing, claiming artist profiles, purchases, licences, creations and creator earnings.</p>
        {capability.provider === 'google' ? (
          <form action={async () => { 'use server'; await signIn('google', { redirectTo: '/account' }); }}>
            <button className="primary authAction" type="submit">Continue with Google</button>
          </form>
        ) : (
          <div className="accountState">TO CREATE · GOOGLE OAUTH CREDENTIALS REQUIRED</div>
        )}
      </section>
      <section className="emptyState authNote">
        <strong>Why Google first?</strong>
        <span>It minimizes password-handling risk and avoids building a commodity identity system. ReggaeAI remains provider-neutral and can add email sign-in later without changing creator ownership records.</span>
        <a href="/">← Back to ReggaeAI</a>
      </section>
    </main>
  );
}
