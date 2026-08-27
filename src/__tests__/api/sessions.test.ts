import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = path.join(__dirname, '../../..', 'test-api-sessions-' + process.pid + '.sqlite');

const mockAuth = vi.fn();
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}));

describe('/api/sessions API Route', () => {
  let route: typeof import('@/app/api/sessions/route');
  let userOps: typeof import('@/lib/users');
  let sessionOps: typeof import('@/lib/sessions');
  let dbMod: typeof import('@/lib/db');
  let db: import('@/lib/db').Database;

  beforeEach(async () => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    process.env.DATABASE_PATH = TEST_DB_PATH;
    mockAuth.mockReset();

    dbMod = await import('@/lib/db');
    db = dbMod.getDatabase();
    userOps = await import('@/lib/users');
    sessionOps = await import('@/lib/sessions');
    route = await import('@/app/api/sessions/route');

    // Seed a test topic
    db.prepare(`
      INSERT INTO topics (id, numer, pytanie, odpowiedz)
      VALUES (?, ?, ?, ?)
    `).run('topic-abc', 1, 'Pytanie testowe', 'Odpowiedz testowa');
  });

  afterEach(() => {
    dbMod.resetDatabase();
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  });

  describe('POST /api/sessions', () => {
    function postRequest(body: unknown) {
      return new Request('http://localhost/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }) as any;
    }

    it('rejects an anonymous user', async () => {
      mockAuth.mockResolvedValue(null);

      const res = await route.POST(postRequest({ topicId: 'topic-abc' }));
      expect(res.status).toBe(401);
    });

    it('creates a session and deducts token for an authenticated user', async () => {
      const user = userOps.findOrCreateUser(db, { email: 'uczen@example.pl' });
      mockAuth.mockResolvedValue({
        user: { email: user.email },
        userId: user.id,
        ageConfirmed: true,
      });

      const res = await route.POST(postRequest({ topicId: 'topic-abc' }));
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.session).toBeDefined();
      expect(data.session.topic_id).toBe('topic-abc');
      
      // Token deducted
      const updated = userOps.getUserById(db, user.id);
      expect(updated?.tokens).toBe(29);
    });
  });

  describe('GET /api/sessions', () => {
    function getRequest() {
      return new Request('http://localhost/api/sessions', {
        method: 'GET',
      }) as any;
    }

    it('rejects an anonymous user', async () => {
      mockAuth.mockResolvedValue(null);

      const res = await route.GET(getRequest());
      expect(res.status).toBe(401);
    });

    it('returns empty list if user has no sessions', async () => {
      const user = userOps.findOrCreateUser(db, { email: 'uczen@example.pl' });
      mockAuth.mockResolvedValue({
        user: { email: user.email },
        userId: user.id,
        ageConfirmed: true,
      });

      const res = await route.GET(getRequest());
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.sessions).toEqual([]);
    });

    it('returns all sessions with scores for the authenticated user', async () => {
      const user = userOps.findOrCreateUser(db, { email: 'uczen@example.pl' });
      mockAuth.mockResolvedValue({
        user: { email: user.email },
        userId: user.id,
        ageConfirmed: true,
      });

      // Create a session and score
      const { session } = sessionOps.createSession(db, user.id, 'topic-abc');
      db.prepare(`
        INSERT INTO session_scores (session_id, is_correct, score, feedback)
        VALUES (?, 1, 8, 'Swietna robota')
      `).run(session!.id);

      const res = await route.GET(getRequest());
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.sessions).toHaveLength(1);
      expect(data.sessions[0].id).toBe(session!.id);
      expect(data.sessions[0].score).toBe(8);
      expect(data.sessions[0].feedback).toBe('Swietna robota');
      expect(data.sessions[0].pytanie).toBe('Pytanie testowe');
      expect(data.sessions[0].numer).toBe(1);
    });
  });
});
