import { describe, it, expect, beforeEach, vi } from 'vitest';
import { findOrCreateUser, deductToken, addTokens, getUserById, confirmAge, User } from '@/lib/users';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

vi.mock('@supabase/supabase-js', () => {
  const mockClient = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
  return {
    createClient: () => mockClient,
    SupabaseClient: class {},
  };
});

describe('User Management (Supabase)', () => {
  let db: any;

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'some-key');
    db = createClient('https://example.supabase.co', 'some-key');
    vi.clearAllMocks();
  });

  describe('findOrCreateUser', () => {
    it('returns existing user if found by email', async () => {
      const mockUser = { id: 'u1', email: 'existing@example.com', name: 'User 1', tokens: 10 };
      db.single.mockResolvedValueOnce({ data: mockUser, error: null });

      const user = await findOrCreateUser(db, { email: 'existing@example.com' });

      expect(user).toEqual(mockUser);
      expect(db.from).toHaveBeenCalledWith('users');
      expect(db.select).toHaveBeenCalled();
      expect(db.eq).toHaveBeenCalledWith('email', 'existing@example.com');
    });

    it('creates a new user with 10 tokens if not found', async () => {
      // First call (findUser): no user found
      db.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows' } });
      // Second call (insert): success
      db.insert.mockResolvedValueOnce({ data: null, error: null });
      // Third call (fetch newly created user): success
      const mockCreated = { id: 'new-id', email: 'new@example.com', name: 'New User', tokens: 10 };
      db.single.mockResolvedValueOnce({ data: mockCreated, error: null });

      const user = await findOrCreateUser(db, {
        email: 'new@example.com',
        name: 'New User',
      });

      expect(user).toEqual(mockCreated);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('deductToken', () => {
    it('deducts a token successfully if balance > 0', async () => {
      // First call (get tokens): returns 10 tokens
      db.single.mockResolvedValueOnce({ data: { tokens: 10 }, error: null });
      // Second call (update): returns 9 tokens
      db.single.mockResolvedValueOnce({ data: { tokens: 9 }, error: null });

      const result = await deductToken(db, 'user-123');

      expect(result).toEqual({ success: true, remainingTokens: 9 });
      expect(db.update).toHaveBeenCalledWith({ tokens: 9 });
      expect(db.eq).toHaveBeenCalledWith('id', 'user-123');
    });

    it('fails to deduct token if balance is 0', async () => {
      db.single.mockResolvedValueOnce({ data: { tokens: 0 }, error: null });

      const result = await deductToken(db, 'user-123');

      expect(result).toEqual({ success: false, remainingTokens: 0 });
      expect(db.update).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('returns the user if found', async () => {
      const mockUser = { id: 'u1', email: 'user@example.com', tokens: 10 };
      db.single.mockResolvedValueOnce({ data: mockUser, error: null });

      const user = await getUserById(db, 'u1');

      expect(user).toEqual(mockUser);
      expect(db.eq).toHaveBeenCalledWith('id', 'u1');
    });

    it('returns undefined if user not found', async () => {
      db.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows' } });

      const user = await getUserById(db, 'u1');

      expect(user).toBeUndefined();
    });
  });

  describe('confirmAge', () => {
    it('updates age_confirmed to 1', async () => {
      db.update.mockReturnValueOnce(db);
      db.eq.mockResolvedValueOnce({ error: null });

      await expect(confirmAge(db, 'u1')).resolves.not.toThrow();

      expect(db.update).toHaveBeenCalledWith({ age_confirmed: 1 });
      expect(db.eq).toHaveBeenCalledWith('id', 'u1');
    });
  });

  describe("addTokens", () => {
    it("adds tokens successfully to user balance", async () => {
      db.single.mockResolvedValueOnce({ data: { tokens: 10 }, error: null });
      db.single.mockResolvedValueOnce({ data: { tokens: 60 }, error: null });

      const result = await addTokens(db, "user-123", 50);

      expect(result).toEqual({ success: true, remainingTokens: 60 });
      expect(db.update).toHaveBeenCalledWith({ tokens: 60 });
      expect(db.eq).toHaveBeenCalledWith("id", "user-123");
    });
  });

});
