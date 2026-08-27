/**
 * SQLite database initialization with migrations.
 * Uses better-sqlite3 for synchronous, zero-latency access.
 *
 * Ticket 09: getDatabase() is now a singleton — it returns the same open
 * connection for the lifetime of the process instead of opening a new one (and
 * re-running migrations) on every call. This eliminates the overhead at 17+
 * call sites and avoids re-executing migrations repeatedly.
 *
 * Migration path (expand → migrate → contract):
 *   - Ticket 09 (this file): add singleton + no-op close() shim
 *   - Tickets 10–12: remove db.close() callers one batch at a time
 *   - Ticket 13: restore real close() or remove it from the public API
 */
import BetterSqlite3 from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export type Database = BetterSqlite3.Database;

const MIGRATIONS = [
  // Migration 001: Topics table (simplified math structure)
  `CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    numer INTEGER UNIQUE NOT NULL,
    pytanie TEXT NOT NULL,
    odpowiedz TEXT NOT NULL
  );`,

  // Migration 002: Sessions table
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL REFERENCES topics(id),
    user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'evaluating', 'completed', 'evaluation_failed')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`,

  // Migration 003: Users table
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    tokens INTEGER NOT NULL DEFAULT 30,
    age_confirmed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`,

  // Migration 004: Session_Transcripts table (raw ASR output)
  `CREATE TABLE IF NOT EXISTS session_transcripts (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`,

  // Migration 005: Session_Scores table (math correctness + score + feedback)
  `CREATE TABLE IF NOT EXISTS session_scores (
    session_id TEXT PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
    is_correct INTEGER NOT NULL CHECK(is_correct IN (0, 1)),
    score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 10),
    feedback TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`,

  // Migration 006: Schema version tracking
  `CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`,
];

// Ticket 09: module-level singleton — one open connection per DB path per process.
// Key = resolved absolute path so ':memory:' and relative paths are handled correctly.
let _db: Database | null = null;
let _dbPath: string | null = null;

/**
 * Opens or returns the existing SQLite database connection.
 *
 * Ticket 09: the connection is cached in a module-level variable so migrations
 * run only once and subsequent calls pay zero open+migrate overhead.
 */
export function getDatabase(dbPath?: string): Database {
  const resolvedPath = dbPath || process.env.DATABASE_PATH || './data/matura.sqlite';

  // Return the existing connection if it was opened for the same path.
  if (_db && _dbPath === resolvedPath) {
    return _db;
  }

  // Different path requested — close the old connection (if any) and open a new one.
  if (_db && _dbPath !== resolvedPath) {
    _db.close();
    _db = null;
    _dbPath = null;
  }

  // Ensure directory exists
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir) && resolvedPath !== ':memory:') {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new BetterSqlite3(resolvedPath);

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Run migrations once
  runMigrations(db);

  _db = db;
  _dbPath = resolvedPath;

  return db;
}

/**
 * Closes and discards the current singleton connection.
 *
 * Only exported for test isolation — production code must never call this.
 * Tests that create a DB at a unique path use this to ensure the next
 * getDatabase() call opens a fresh connection to the new path.
 */
export function resetDatabase(): void {
  if (_db) {
    try {
      _db.close();
    } catch {
      // Ignore errors on close (e.g. already closed)
    }
    _db = null;
    _dbPath = null;
  }
}

function runMigrations(db: Database): void {
  db.transaction(() => {
    for (const migration of MIGRATIONS) {
      db.exec(migration);
    }
  })();
}
