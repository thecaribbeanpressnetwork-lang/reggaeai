import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { databaseConfigured, query } from './lib/db';

const googleReady = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: googleReady ? [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: false
    })
  ] : [],
  pages: { signIn: '/signin' },
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email || account?.provider !== 'google') return false;
      if (!databaseConfigured()) return true;

      try {
        await query(
          `insert into users (email, display_name, avatar_url, auth_provider, auth_subject, email_verified)
           values ($1,$2,$3,$4,$5,true)
           on conflict (email) do update set
             display_name = excluded.display_name,
             avatar_url = excluded.avatar_url,
             auth_provider = excluded.auth_provider,
             auth_subject = excluded.auth_subject,
             email_verified = true,
             updated_at = now()`,
          [user.email.toLowerCase(), user.name || null, user.image || null, account.provider, account.providerAccountId]
        );
      } catch (error) {
        console.error('auth_user_persist_failed', error?.message || error);
        return false;
      }
      return true;
    },
    async jwt({ token }) {
      if (!token?.email || !databaseConfigured()) return token;
      try {
        const result = await query('select id from users where email = $1 limit 1', [String(token.email).toLowerCase()]);
        if (result.rows[0]?.id) token.userId = result.rows[0].id;
      } catch (error) {
        console.error('auth_user_lookup_failed', error?.message || error);
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.userId) session.user.id = token.userId;
      return session;
    }
  }
});

export function authCapability() {
  return {
    framework: 'Auth.js',
    provider: googleReady ? 'google' : null,
    state: googleReady ? 'READY' : 'TO_CREATE'
  };
}
