import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { requireAuth, requireSessionOwner } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';

// Mock the NextAuth session import
const mockAuth = vi.fn();
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@supabase/supabase-js', () => {
  const mockClient = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
  return {
    createClient: () => mockClient,
    SupabaseClient: class {},
  };
});

describe('API route guard (Supabase)', () => {
  let db: any;

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'some-key');
    mockAuth.mockReset();
    db = createClient('https://example.supabase.co', 'some-key');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('requireAuth', () => {
    it('rejects a caller with no session', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await requireAuth();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.response.status).toBe(401);
      }
    });

    it('rejects a session that carries no email', async () => {
      mockAuth.mockResolvedValue({ user: {} });

      const result = await requireAuth();

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(401);
    });

    it('rejects an authenticated session whose user row is gone', async () => {
      mockAuth.mockResolvedValue({ user: { email: 'a@b.pl' } });

      const result = await requireAuth();

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

      const result = await requireAuth();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.userId).toBe('user-1');
        expect(result.email).toBe('a@b.pl');
      }
    });

    it('returns a JSON body, not an empty 401', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await requireAuth();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        const body = await result.response.json();
        expect(body.error).toBeTruthy();
      }
    });
  });

  describe('requireSessionOwner', () => {
    it('accepts the session owner', async () => {
      db.single.mockResolvedValueOnce({
        data: { id: 'session-1', topic_id: 'topic-1', user_id: 'owner-1', status: 'active' },
        error: null,
      });

      const result = await requireSessionOwner(db, 'session-1', 'owner-1');

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.session.id).toBe('session-1');
    });

    it('rejects a different signed-in user with 404, not 403', async () => {
      db.single.mockResolvedValueOnce({
        data: { id: 'session-1', topic_id: 'topic-1', user_id: 'owner-1', status: 'active' },
        error: null,
      });

      const result = await requireSessionOwner(db, 'session-1', 'intruder-9');

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(404);
    });

    it('rejects an unknown session id', async () => {
      db.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows' },
      });

      const result = await requireSessionOwner(db, 'no-such-session', 'owner-1');

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(404);
    });
  });
});
