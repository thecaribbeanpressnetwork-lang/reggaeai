import { authCapability, signIn } from '../../auth';

export const metadata = { title: 'Sign in | ReggaeAI', robots: { index: false, follow: false } };

export default function SignInPage() {
  const capability = authCapability();

  return (
    <main className="accountShell authShell">
      <section className="accountHero compact authHero">
        <div className="authBrandMark" aria-hidden="true">
          <img src="/reggaeai-lion.svg" alt="" />
        </div>
        <div className="authCopy">
          <span className="eyebrow">REGGAEAI ACCOUNT</span>
          <h1>One identity for Caribbean sound, creation and ownership.</h1>
          <p>Listen freely. Sign in when you want to save music, import or create tracks, claim an artist profile, license work, purchase releases or manage creator earnings.</p>
          {capability.provider === 'google' ? (
            <form action={async () => { 'use server'; await signIn('google', { redirectTo: '/account' }); }}>
              <button className="primary authAction" type="submit">Continue with Google</button>
            </form>
          ) : (
            <div className="accountState">GOOGLE SIGN-IN IS TEMPORARILY UNAVAILABLE</div>
          )}
          <div className="authMicrocopy">Secure sign-in · No ReggaeAI password to manage · Creator ownership stays tied to your verified account</div>
        </div>
      </section>
      <section className="emptyState authNote authTrust">
        <span className="eyebrow">CARIBBEAN SOUND · FUTURE INTELLIGENCE</span>
        <strong>Built for listeners, artists and AI creators without blurring who owns what.</strong>
        <span>ReggaeAI keeps public discovery open while identity-sensitive actions use a verified account. Uploads and imports do not transfer ownership to ReggaeAI or Shot Call Records.</span>
        <a href="/">← Back to Discover</a>
      </section>
    </main>
  );
}
