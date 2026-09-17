/**
 * NextAuth.js configuration with Google OAuth provider.
 * On first login, creates a user with 3 free tokens.
 */
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { getDatabase } from './db';
import { findOrCreateUser } from './users';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        const db = getDatabase();
        await findOrCreateUser(db, {
          email: user.email,
          name: user.name,
          image: user.image,
        });
        return true;
      } catch (error) {
        console.error('Error during sign-in:', error);
        return false;
      }
    },
    async session({ session }) {
      if (session.user?.email) {
        try {
          const db = getDatabase();
          const { data: dbUser, error } = await db
            .from('users')
            .select('id, tokens, age_confirmed, role')
            .eq('email', session.user.email)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Failed to query user for session enrichment:', error.message);
          }

          if (dbUser) {
            session.userId = dbUser.id;
            session.tokens = dbUser.tokens;
            session.ageConfirmed = dbUser.age_confirmed === 1;
            session.role = dbUser.role;
          }
        } catch (error) {
          console.error('Error enriching session:', error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
