/**
 * User management operations — creation, token management, age confirmation.
 */
import type { Database } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  tokens: number;
  age_confirmed: number;
  created_at: string;
}

export interface TokenResult {
  success: boolean;
  remainingTokens: number;
}

/**
 * Finds an existing user by email, or creates a new one with 30 free tokens.
 * Idempotent — calling multiple times with the same email won't create duplicates.
 */
export function findOrCreateUser(
  db: Database,
  profile: { email: string; name?: string | null; image?: string | null }
): User {
  const existing = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(profile.email) as User | undefined;

  if (existing) {
    return existing;
  }

  const id = uuidv4();
  db.prepare(
    `INSERT INTO users (id, email, name, image, tokens, age_confirmed) VALUES (?, ?, ?, ?, 30, 0)`
  ).run(id, profile.email, profile.name || null, profile.image || null);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User;
}

/**
 * Deducts 1 token from the user's balance.
 * Returns success=false if the user has 0 tokens.
 */
export function deductToken(db: Database, userId: string): TokenResult {
  const user = db
    .prepare('SELECT tokens FROM users WHERE id = ?')
    .get(userId) as { tokens: number } | undefined;

  if (!user || user.tokens <= 0) {
    return { success: false, remainingTokens: user?.tokens || 0 };
  }

  db.prepare('UPDATE users SET tokens = tokens - 1 WHERE id = ?').run(userId);

  const updated = db
    .prepare('SELECT tokens FROM users WHERE id = ?')
    .get(userId) as { tokens: number };

  return { success: true, remainingTokens: updated.tokens };
}

/**
 * Gets a user by their ID.
 */
export function getUserById(db: Database, userId: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
}

/**
 * Confirms the user's age self-declaration.
 */
export function confirmAge(db: Database, userId: string): void {
  db.prepare('UPDATE users SET age_confirmed = 1 WHERE id = ?').run(userId);
}
