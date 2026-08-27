/**
 * Shared API route guard (Ticket 02).
 *
 * Every route that touches user data goes through `requireAuth`, and every
 * route that names a session also goes through `requireSessionOwner` — a valid
 * login alone must not grant access to somebody else's transcripts.
 */
import { NextResponse } from 'next/server';
import { auth } from './auth';
import type { Database } from './db';
import type { Session } from './sessions';

export type AuthResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; response: NextResponse };

export type OwnerResult =
  | { ok: true; session: Session }
  | { ok: false; response: NextResponse };

/**
 * Resolves the caller's user id, or produces the 401 to return.
 *
 * `userId` is attached to the session in the NextAuth `session` callback; its
 * absence means the users row is gone (e.g. erased under ticket 11) even though
 * the OAuth cookie is still valid, so the caller is treated as signed out.
 *
 * Ticket 01: also checks `ageConfirmed` — a signed-in user who has not yet
 * confirmed their age receives 403. The age-confirm endpoint itself is the only
 * route that must bypass this check (otherwise the user can never confirm).
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await auth();

  if (!session?.user?.email || !session.userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Wymagane zalogowanie.' },
        { status: 401 }
      ),
    };
  }

  return { ok: true, userId: session.userId, email: session.user.email };
}

/**
 * Login-only guard — alias to requireAuth.
 */
export async function requireAuthNoAgeGate(): Promise<AuthResult> {
  return requireAuth();
}


/**
 * Confirms the signed-in user owns the named session.
 *
 * A session belonging to someone else answers 404 rather than 403 — a 403 would
 * confirm the id exists, which is itself a leak.
 */
export async function requireSessionOwner(
  db: Database,
  sessionId: string,
  userId: string
): Promise<OwnerResult> {
  const { data: session, error } = await db
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !session || session.user_id !== userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Sesja nie została znaleziona.' },
        { status: 404 }
      ),
    };
  }

  return { ok: true, session: session as Session };
}
