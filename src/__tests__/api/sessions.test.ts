import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mockRequireAuth = vi.fn();
vi.mock('@/lib/api-auth', () => ({
  requireAuth: () => mockRequireAuth(),
}));

const mockCreateSession = vi.fn();
vi.mock('@/lib/sessions', () => ({
  createSession: (...args: any[]) => mockCreateSession(...args),
}));

vi.mock('@supabase/supabase-js', () => {
  const mockClient = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  };
  return {
    createClient: () => mockClient,
    SupabaseClient: class {},
  };
});

describe('/api/sessions API Route (Supabase)', () => {
  let route: typeof import('@/app/api/sessions/route');
  let dbMod: typeof import('@/lib/db');
  let db: any;

  beforeEach(async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'some-key');
    mockRequireAuth.mockReset();
    mockCreateSession.mockReset();

    dbMod = await import('@/lib/db');
    dbMod.resetDatabase();
    db = dbMod.getDatabase();
    route = await import('@/app/api/sessions/route');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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
      mockRequireAuth.mockResolvedValue({
        ok: false,
        response: new Response(JSON.stringify({ error: 'Unauthenticated' }), { status: 401 }),
      });

      const res = await route.POST(postRequest({ topicId: 'topic-abc' }));
      expect(res.status).toBe(401);
    });

    it('creates a session and deducts token for an authenticated user', async () => {
      mockRequireAuth.mockResolvedValue({
        ok: true,
        userId: 'user-123',
        email: 'uczen@example.pl',
      });
      mockCreateSession.mockResolvedValue({
        success: true,
        session: { id: 'session-123', topic_id: 'topic-abc', user_id: 'user-123', status: 'active' },
      });

      const res = await route.POST(postRequest({ topicId: 'topic-abc' }));
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.session).toBeDefined();
      expect(data.session.id).toBe('session-123');
      expect(mockCreateSession).toHaveBeenCalledWith(db, 'user-123', 'topic-abc');
    });

    it('returns 402 if session creation fails due to token balance', async () => {
      mockRequireAuth.mockResolvedValue({
        ok: true,
        userId: 'user-123',
        email: 'uczen@example.pl',
      });
      mockCreateSession.mockResolvedValue({
        success: false,
        error: 'Brak tokenów.',
      });

      const res = await route.POST(postRequest({ topicId: 'topic-abc' }));
      expect(res.status).toBe(402);
      const data = await res.json();
      expect(data.error).toBe('Brak tokenów.');
    });
  });

  describe('GET /api/sessions', () => {
    function getRequest() {
      return new Request('http://localhost/api/sessions', {
        method: 'GET',
      }) as any;
    }

    it('rejects an anonymous user', async () => {
      mockRequireAuth.mockResolvedValue({
        ok: false,
        response: new Response(JSON.stringify({ error: 'Unauthenticated' }), { status: 401 }),
      });

      const res = await route.GET(getRequest());
      expect(res.status).toBe(401);
    });

    it('returns empty list if user has no sessions', async () => {
      mockRequireAuth.mockResolvedValue({
        ok: true,
        userId: 'user-123',
        email: 'uczen@example.pl',
      });

      const mockFrom = vi.spyOn(db, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      } as any);

      const res = await route.GET(getRequest());
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.sessions).toEqual([]);
      mockFrom.mockRestore();
    });

    it('returns all sessions with scores for the authenticated user', async () => {
      mockRequireAuth.mockResolvedValue({
        ok: true,
        userId: 'user-123',
        email: 'uczen@example.pl',
      });

      const rawDbSession = {
        id: 'session-123',
        topic_id: 'topic-abc',
        status: 'completed',
        created_at: '2026-08-27T10:00:00Z',
        topics: {
          numer: 1,
          pytanie: 'Pytanie testowe',
          odpowiedz: 'Odpowiedz testowa',
        },
        session_scores: {
          is_correct: 1,
          score: 8,
          feedback: 'Swietna robota',
        },
      };

      const mockFrom = vi.spyOn(db, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [rawDbSession], error: null }),
      } as any);

      const res = await route.GET(getRequest());
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.sessions).toHaveLength(1);
      expect(data.sessions[0].id).toBe('session-123');
      expect(data.sessions[0].topic_id).toBe('topic-abc');
      expect(data.sessions[0].score).toBe(8);
      expect(data.sessions[0].feedback).toBe('Swietna robota');
      expect(data.sessions[0].pytanie).toBe('Pytanie testowe');
      expect(data.sessions[0].numer).toBe(1);
      mockFrom.mockRestore();
    });
  });
});
