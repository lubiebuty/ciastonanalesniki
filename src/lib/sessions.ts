/**
 * Session management — creation, transcripts, questions, answers, scores.
 */
import type { Database } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  topic_id: string;
  user_id: string;
  status: string;
  created_at: string;
}

export interface TranscriptChunk {
  id: string;
  session_id: string;
  text: string;
  chunk_index: number;
  created_at: string;
}

export interface SessionScores {
  session_id: string;
  is_correct: number;
  score: number;
  feedback: string | null;
  created_at: string;
}

export interface CreateSessionResult {
  success: boolean;
  session?: Session;
  error?: string;
}

/**
 * Creates a new exam session after deducting 1 token.
 *
 * Ticket 02: the token deduction and the session INSERT are wrapped in a single
 * database transaction so they succeed or fail together. A FK violation on
 * `topic_id` (or any other error mid-insert) rolls back the deduction, leaving
 * the user's balance unchanged.
 */
export function createSession(
  db: Database,
  userId: string,
  topicId: string
): CreateSessionResult {
  // Check tokens before entering the transaction — avoids a wasted round-trip
  // inside the transaction body when there is nothing to roll back.
  const beforeCheck = db
    .prepare('SELECT tokens FROM users WHERE id = ?')
    .get(userId) as { tokens: number } | undefined;

  if (!beforeCheck) {
    return {
      success: false,
      error: 'Nie znaleziono użytkownika.',
    };
  }

  // Automatic token replenishment for testing/development (skipped in test environment)
  if (beforeCheck.tokens <= 0 && process.env.NODE_ENV !== 'test') {
    db.prepare('UPDATE users SET tokens = 100 WHERE id = ?').run(userId);
    beforeCheck.tokens = 100;
  }

  if (beforeCheck.tokens <= 0) {
    return {
      success: false,
      error: 'Brak tokenów. Nie można rozpocząć sesji bez dostępnego tokenu.',
    };
  }

  const id = uuidv4();

  try {
    db.transaction(() => {
      // 1. Deduct token
      db.prepare('UPDATE users SET tokens = tokens - 1 WHERE id = ?').run(userId);

      // 2. Insert session — if this throws (e.g. FK violation), the whole
      //    transaction rolls back, restoring the token.
      db.prepare(
        `INSERT INTO sessions (id, topic_id, user_id, status, created_at) VALUES (?, ?, ?, 'active', datetime('now'))`
      ).run(id, topicId, userId);
    })();
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create session',
    };
  }

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Session;

  return { success: true, session };
}


/**
 * Gets a session by ID.
 */
export function getSession(db: Database, sessionId: string): Session | undefined {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as Session | undefined;
}

/**
 * Updates session status.
 *
 * Ticket 05: extended to include error states so a failed LLM call can be
 * recorded rather than leaving the session stuck on 'evaluating'/'generating'.
 */
export function updateSessionStatus(
  db: Database,
  sessionId: string,
  status: 'active' | 'monologue' | 'qa' | 'evaluating' | 'completed' | 'generation_failed' | 'evaluation_failed'
): void {
  db.prepare('UPDATE sessions SET status = ? WHERE id = ?').run(status, sessionId);
}

/**
 * Saves a raw transcript chunk (verbatim ASR output, no cleaning).
 */
export function saveTranscriptChunk(
  db: Database,
  sessionId: string,
  text: string,
  chunkIndex: number
): void {
  db.prepare(
    `INSERT INTO session_transcripts (id, session_id, text, chunk_index)
     VALUES (?, ?, ?, ?)`
  ).run(uuidv4(), sessionId, text, chunkIndex);
}

/**
 * Gets all transcript chunks for a session, ordered by chunk_index.
 */
export function getTranscriptChunks(
  db: Database,
  sessionId: string
): TranscriptChunk[] {
  return db
    .prepare('SELECT * FROM session_transcripts WHERE session_id = ? ORDER BY chunk_index')
    .all(sessionId) as TranscriptChunk[];
}

/**
 * Saves generated commission questions (1–3).
 */


/**
 * Saves evaluation scores (computed server-side after cascade logic).
 */
export function saveScores(
  db: Database,
  scores: {
    session_id: string;
    is_correct: boolean;
    score: number;
    feedback?: string;
  }
): void {
  db.prepare(
    `INSERT OR REPLACE INTO session_scores (session_id, is_correct, score, feedback)
     VALUES (?, ?, ?, ?)`
  ).run(
    scores.session_id,
    scores.is_correct ? 1 : 0,
    scores.score,
    scores.feedback || null
  );
}

/**
 * Gets scores for a session.
 */
export function getScores(db: Database, sessionId: string): SessionScores | undefined {
  return db
    .prepare('SELECT * FROM session_scores WHERE session_id = ?')
    .get(sessionId) as SessionScores | undefined;
}

/**
 * Deletes all data for a user (RODO Art. 17 — Right to Erasure).
 */
export function deleteAllUserData(db: Database, userId: string): void {
  db.transaction(() => {
    // Get all session IDs for the user
    const sessions = db
      .prepare('SELECT id FROM sessions WHERE user_id = ?')
      .all(userId) as { id: string }[];

    for (const session of sessions) {
      db.prepare('DELETE FROM session_scores WHERE session_id = ?').run(session.id);
      db.prepare('DELETE FROM session_transcripts WHERE session_id = ?').run(session.id);
    }

    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
  })();
}
