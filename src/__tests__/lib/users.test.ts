/**
 * TDD Tests for user/auth functionality.
 * Tests token allocation, user creation, and token deduction.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = path.join(__dirname, '../../..', 'test-users-' + process.pid + '.sqlite');

describe('User Management', () => {
  let userOps: typeof import('@/lib/users');
  let dbMod: typeof import('@/lib/db');
  let db: import('@/lib/db').Database;

  beforeEach(async () => {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    process.env.DATABASE_PATH = TEST_DB_PATH;

    // Dynamic imports to get fresh module instances
    dbMod = await import('@/lib/db');
    db = dbMod.getDatabase();
    userOps = await import('@/lib/users');
  });

  afterEach(() => {
    // getDatabase() is a singleton (Ticket 09); db.close() would kill the
    // shared connection for the rest of the process. Use resetDatabase() so
    // the next test's getDatabase() call opens a fresh connection instead.
    dbMod.resetDatabase();
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  });

  describe('User creation', () => {
    it('creates a new user with 30 free tokens on first login', () => {
      const user = userOps.findOrCreateUser(db, {
        email: 'student@example.com',
        name: 'Jan Kowalski',
        image: 'https://example.com/avatar.jpg',
      });

      expect(user.email).toBe('student@example.com');
      expect(user.tokens).toBe(30);
      expect(user.name).toBe('Jan Kowalski');
    });

    it('returns existing user on second login (no extra tokens)', () => {
      userOps.findOrCreateUser(db, {
        email: 'repeat@example.com',
        name: 'User',
      });

      const user2 = userOps.findOrCreateUser(db, {
        email: 'repeat@example.com',
        name: 'User',
      });

      expect(user2.tokens).toBe(30); // Still 30, not 60
    });

    it('stores user avatar URL', () => {
      const user = userOps.findOrCreateUser(db, {
        email: 'avatar@example.com',
        name: 'Test',
        image: 'https://lh3.google.com/avatar.jpg',
      });

      expect(user.image).toBe('https://lh3.google.com/avatar.jpg');
    });
  });

  describe('Token management', () => {
    it('deducts 1 token successfully when user has tokens', () => {
      const user = userOps.findOrCreateUser(db, {
        email: 'tokens@test.com',
        name: 'Test',
      });

      const result = userOps.deductToken(db, user.id);
      expect(result.success).toBe(true);
      expect(result.remainingTokens).toBe(29);
    });

    it('fails to deduct when user has 0 tokens', () => {
      const user = userOps.findOrCreateUser(db, {
        email: 'broke@test.com',
        name: 'Test',
      });

      // Use up all 30 tokens
      for (let i = 0; i < 30; i++) {
        userOps.deductToken(db, user.id);
      }

      const result = userOps.deductToken(db, user.id);
      expect(result.success).toBe(false);
      expect(result.remainingTokens).toBe(0);
    });

    it('tracks correct balance after multiple deductions', () => {
      const user = userOps.findOrCreateUser(db, {
        email: 'track@test.com',
        name: 'Test',
      });

      userOps.deductToken(db, user.id);
      const result = userOps.deductToken(db, user.id);
      expect(result.remainingTokens).toBe(28);
    });
  });

  describe('Users table schema', () => {
    it('has age_confirmed column', () => {
      const tableInfo = db.pragma('table_info(users)') as Array<{ name: string }>;
      const columns = tableInfo.map((c) => c.name);
      expect(columns).toContain('age_confirmed');
    });

    it('age_confirmed defaults to false (0)', () => {
      const user = userOps.findOrCreateUser(db, {
        email: 'minor@test.com',
        name: 'Student',
      });
      expect(user.age_confirmed).toBe(0);
    });

    it('can confirm age', () => {
      const user = userOps.findOrCreateUser(db, {
        email: 'confirm@test.com',
        name: 'Student',
      });

      userOps.confirmAge(db, user.id);

      const updated = userOps.getUserById(db, user.id);
      expect(updated?.age_confirmed).toBe(1);
    });
  });
});
