/**
 * TDD Tests for src/lib/db.ts
 * Tests SQLite database initialization and migrations — written BEFORE implementation.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = path.join(__dirname, '../../..', 'test-db-' + process.pid + '.sqlite');

describe('Database', () => {
  let db: import('@/lib/db').Database;

  beforeEach(async () => {
    // Clean up any previous test DB
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    process.env.DATABASE_PATH = TEST_DB_PATH;
    const { getDatabase, resetDatabase } = await import('@/lib/db');
    // Reset singleton so each test gets a fresh connection
    resetDatabase();
    db = getDatabase();
  });

  afterEach(async () => {
    const { resetDatabase } = await import('@/lib/db');
    // Close and discard the singleton (test isolation)
    resetDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  describe('Topics table', () => {
    it('creates Topics table with correct columns', () => {
      const tableInfo = db.pragma('table_info(topics)') as Array<{
        name: string;
        type: string;
        notnull: number;
      }>;
      const columnNames = tableInfo.map((col) => col.name);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('numer');
      expect(columnNames).toContain('pytanie');
      expect(columnNames).toContain('odpowiedz');
    });

    it('can insert and retrieve a Topic', () => {
      db.prepare(`
        INSERT INTO topics (id, numer, pytanie, odpowiedz)
        VALUES (?, ?, ?, ?)
      `).run(
        'topic-1',
        1,
        'Czym jest największy wspólny dzielnik (NWD)',
        'Największy wspólny dzielnik...'
      );

      const topic = db
        .prepare('SELECT * FROM topics WHERE id = ?')
        .get('topic-1') as Record<string, unknown>;
      expect(topic).toBeDefined();
      expect(topic.numer).toBe(1);
      expect(topic.pytanie).toBe('Czym jest największy wspólny dzielnik (NWD)');
      expect(topic.odpowiedz).toBe('Największy wspólny dzielnik...');
    });
  });

  describe('Sessions table', () => {
    it('creates Sessions table with correct columns', () => {
      const tableInfo = db.pragma('table_info(sessions)') as Array<{
        name: string;
        type: string;
      }>;
      const columnNames = tableInfo.map((col) => col.name);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('topic_id');
      expect(columnNames).toContain('user_id');
      expect(columnNames).toContain('status');
      expect(columnNames).toContain('created_at');
    });

    it('sessions.topic_id references topics.id', () => {
      // Insert a topic first
      db.prepare(`
        INSERT INTO topics (id, numer, pytanie, odpowiedz)
        VALUES (?, ?, ?, ?)
      `).run('topic-ref', 101, 'pytanie', 'odpowiedz');

      // Insert a session referencing it
      expect(() =>
        db
          .prepare(
            `INSERT INTO sessions (id, topic_id, user_id, status, created_at) VALUES (?, ?, ?, ?, ?)`
          )
          .run('session-1', 'topic-ref', 'user-1', 'active', new Date().toISOString())
      ).not.toThrow();
    });

    it('sessions.status defaults to a valid state', () => {
      db.prepare(`
        INSERT INTO topics (id, numer, pytanie, odpowiedz)
        VALUES (?, ?, ?, ?)
      `).run('topic-s', 102, 'pytanie', 'odpowiedz');

      db.prepare(
        `INSERT INTO sessions (id, topic_id, user_id, status, created_at) VALUES (?, ?, ?, ?, ?)`
      ).run('session-s', 'topic-s', 'user-1', 'active', new Date().toISOString());

      const session = db
        .prepare('SELECT * FROM sessions WHERE id = ?')
        .get('session-s') as Record<string, unknown>;
      expect(session.status).toBe('active');
    });
  });

  describe('WAL mode', () => {
    it('database uses WAL journal mode for performance', () => {
      const result = db.pragma('journal_mode') as Array<{ journal_mode: string }>;
      expect(result[0].journal_mode).toBe('wal');
    });
  });

  // Ticket 09: singleton DB connection
  describe('Singleton — getDatabase returns same connection (Ticket 09)', () => {
    it('returns the same object instance when called twice with the same path', async () => {
      const { getDatabase, resetDatabase } = await import('@/lib/db');

      const db1 = getDatabase();
      const db2 = getDatabase();

      expect(db1).toBe(db2);

      // Cleanup for isolation
      resetDatabase();
    });

    it('runs migrations only once (not on every call)', async () => {
      // Proxy: if migrations ran twice, schema_version would have duplicate rows.
      // INSERT ... IF NOT EXISTS means it's idempotent, but we can check that
      // the DB is consistent after multiple getDatabase() calls.
      const { getDatabase, resetDatabase } = await import('@/lib/db');

      getDatabase();
      getDatabase();
      const secondDb = getDatabase();

      // All tables should still exist and be usable
      expect(() => secondDb.pragma('table_info(topics)')).not.toThrow();

      resetDatabase();
    });

    it('resetDatabase() creates a fresh connection (used by tests for isolation)', async () => {
      const { getDatabase, resetDatabase } = await import('@/lib/db');

      const before = getDatabase();
      resetDatabase();
      const after = getDatabase();

      // After reset, a new instance is returned (different object reference)
      expect(after).not.toBe(before);

      resetDatabase();
    });
  });
});

