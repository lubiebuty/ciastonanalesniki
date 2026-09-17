/**
 * Module augmentation for NextAuth — adds the app-specific fields that
 * `lib/auth.ts` attaches in the `session` callback (user id, token balance,
 * age self-declaration). Without this, every read site needs an unsafe cast.
 */
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    userId?: string;
    tokens?: number;
    ageConfirmed?: boolean;
    role?: 'student' | 'teacher';
  }
}
