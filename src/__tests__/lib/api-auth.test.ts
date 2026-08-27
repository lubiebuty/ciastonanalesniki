/**
 * TDD tests for the shared API route guard (Ticket 02).
 *
 * Ticket 02 requires that API routes are protected and require a valid user
 * session. These tests pin down the two halves of that: proving a caller is
 * signed in, and proving the signed-in caller owns the session they name.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = path.join(__dirname, '../../..', 'test-api-auth-' + process.pid + '.sqlite');

// `auth()` reaches into NextAuth's request context, which does not exist in a
// unit test — the guard's own logic is what is under test here.
const mockAuth = vi.fn();
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}));

describe('API route guard', () => {
  let apiAuth: typeof import('@/lib/api-auth');
  let dbMod: typeof import('@/lib/db');
  let db: import('@/lib/db').Database;

  beforeEach(async () => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    process.env.DATABASE_PATH = TEST_DB_PATH;
    mockAuth.mockReset();

    dbMod = await import('@/lib/db');
    db = dbMod.getDatabase();
    apiAuth = await import('@/lib/api-auth');
  });

  afterEach(() => {
    // getDatabase() is a singleton (Ticket 09); db.close() would kill the
    // shared connection for the rest of the process. Use resetDatabase() so
    // the next test's getDatabase() call opens a fresh connection instead.
    dbMod.resetDatabase();
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  });

  describe('requireAuth', () => {
    it('rejects a caller with no session', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await apiAuth.requireAuth();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.response.status).toBe(401);
      }
    });

    it('rejects a session that carries no email', async () => {
      mockAuth.mockResolvedValue({ user: {} });

      const result = await apiAuth.requireAuth();

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(401);
    });

    it('rejects an authenticated session whose user row is gone', async () => {
      // Signed in via Google, but the DB row was erased (RODO deletion, ticket 11)
      mockAuth.mockResolvedValue({ user: { email: 'a@b.pl' } });

      const result = await apiAuth.requireAuth();

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(401);
    });

    it('accepts a valid session and returns the user id', async () => {
      mockAuth.mockResolvedValue({
        user: { email: 'a@b.pl' },
        userId: 'user-1',
        tokens: 3,
        ageConfirmed: true,
      });

      const result = await apiAuth.requireAuth();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.userId).toBe('user-1');
        expect(result.email).toBe('a@b.pl');
      }
    });

    it('returns a JSON body, not an empty 401', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await apiAuth.requireAuth();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        const body = await result.response.json();
        expect(body.error).toBeTruthy();
      }
    });

    it('accepts a logged-in user without requiring age confirmation', async () => {
      mockAuth.mockResolvedValue({
        user: { email: 'user@example.pl' },
        userId: 'user-1',
        tokens: 3,
      });

      const result = await apiAuth.requireAuth();

      expect(result.ok).toBe(true);
    });
  });

  describe('requireSessionOwner', () => {
    beforeEach(() => {
      db.prepare(
        `INSERT INTO topics (id, numer, pytanie, odpowiedz)
         VALUES (?, ?, ?, ?)`
      ).run('topic-1', 1, 'Pytanie', 'Odpowiedz');

      db.prepare(
        `INSERT INTO sessions (id, topic_id, user_id, status) VALUES (?, ?, ?, 'active')`
      ).run('session-1', 'topic-1', 'owner-1');
    });

    it('accepts the session owner', () => {
      const result = apiAuth.requireSessionOwner(db, 'session-1', 'owner-1');

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.session.id).toBe('session-1');
    });

    it('rejects a different signed-in user with 404, not 403', () => {
      // 404 rather than 403 so the response does not confirm the session exists
      const result = apiAuth.requireSessionOwner(db, 'session-1', 'intruder-9');

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(404);
    });

    it('rejects an unknown session id', () => {
      const result = apiAuth.requireSessionOwner(db, 'no-such-session', 'owner-1');

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(404);
    });
  });
});
