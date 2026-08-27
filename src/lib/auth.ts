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
        findOrCreateUser(db, {
          email: user.email,
          name: user.name,
          image: user.image,
        });
        // Ticket 10-12: db.close() removed — getDatabase() is a singleton.
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
          const dbUser = db
            .prepare('SELECT id, tokens, age_confirmed FROM users WHERE email = ?')
            .get(session.user.email) as
            | { id: string; tokens: number; age_confirmed: number }
            | undefined;
          // Ticket 10-12: db.close() removed — getDatabase() is a singleton.

          if (dbUser) {
            session.userId = dbUser.id;
            session.tokens = dbUser.tokens;
            session.ageConfirmed = dbUser.age_confirmed === 1;
          }
          // Ticket 10-12: db.close() removed — getDatabase() is a singleton.
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
