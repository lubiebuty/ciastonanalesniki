import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('db.ts', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'some-key');
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    const { resetDatabase } = await import('@/lib/db');
    resetDatabase();
  });

  it('getDatabase returns a Supabase client instance and is a singleton', async () => {
    const { getDatabase } = await import('@/lib/db');
    const db1 = getDatabase();
    const db2 = getDatabase();

    expect(db1).toBeDefined();
    expect(db2).toBeDefined();
    expect(db1).toBe(db2); // Singleton check
  });

  it('throws an error if environment variables are missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    const { getDatabase, resetDatabase } = await import('@/lib/db');
    resetDatabase();

    expect(() => getDatabase()).toThrow();
  });
});
