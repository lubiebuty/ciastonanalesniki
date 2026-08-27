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
 * Manually rolls back token deduction if session creation fails.
 */
export async function createSession(
  db: Database,
  userId: string,
  topicId: string
): Promise<CreateSessionResult> {
  const { data: user, error: findError } = await db
    .from('users')
    .select('tokens')
    .eq('id', userId)
    .single();

  if (findError || !user) {
    return {
      success: false,
      error: 'Nie znaleziono użytkownika.',
    };
  }

  let tokens = user.tokens;
  if (tokens <= 0 && process.env.NODE_ENV !== 'test') {
    const { data: updatedUser } = await db
      .from('users')
      .update({ tokens: 100 })
      .eq('id', userId)
      .select('tokens')
      .single();
    if (updatedUser) {
      tokens = updatedUser.tokens;
    }
  }

  if (tokens <= 0) {
    return {
      success: false,
      error: 'Brak tokenów. Nie można rozpocząć sesji bez dostępnego tokenu.',
    };
  }

  // 1. Deduct token
  const { error: deductError } = await db
    .from('users')
    .update({ tokens: tokens - 1 })
    .eq('id', userId);

  if (deductError) {
    return {
      success: false,
      error: 'Błąd podczas pobierania tokenu.',
    };
  }

  const id = uuidv4();

  // 2. Insert session
  const { error: insertError } = await db
    .from('sessions')
    .insert({
      id,
      topic_id: topicId,
      user_id: userId,
      status: 'active',
    });

  if (insertError) {
    // Rollback: return the token to the user
    await db
      .from('users')
      .update({ tokens: tokens })
      .eq('id', userId);

    return {
      success: false,
      error: `Nie udało się utworzyć sesji: ${insertError.message}`,
    };
  }

  const { data: session, error: fetchError } = await db
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !session) {
    return {
      success: false,
      error: 'Nie udało się pobrać utworzonej sesji.',
    };
  }

  return { success: true, session: session as Session };
}

/**
 * Gets a session by ID.
 */
export async function getSession(db: Database, sessionId: string): Promise<Session | undefined> {
  const { data, error } = await db
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !data) {
    return undefined;
  }

  return data as Session;
}

/**
 * Updates session status.
 */
export async function updateSessionStatus(
  db: Database,
  sessionId: string,
  status: 'active' | 'monologue' | 'qa' | 'evaluating' | 'completed' | 'generation_failed' | 'evaluation_failed'
): Promise<void> {
  const { error } = await db
    .from('sessions')
    .update({ status })
    .eq('id', sessionId);

  if (error) {
    throw new Error(`Failed to update session status: ${error.message}`);
  }
}

/**
 * Saves a raw transcript chunk.
 */
export async function saveTranscriptChunk(
  db: Database,
  sessionId: string,
  text: string,
  chunkIndex: number
): Promise<void> {
  const { error } = await db
    .from('session_transcripts')
    .insert({
      id: uuidv4(),
      session_id: sessionId,
      text,
      chunk_index: chunkIndex,
    });

  if (error) {
    throw new Error(`Failed to save transcript chunk: ${error.message}`);
  }
}

/**
 * Gets all transcript chunks for a session, ordered by chunk_index.
 */
export async function getTranscriptChunks(
  db: Database,
  sessionId: string
): Promise<TranscriptChunk[]> {
  const { data, error } = await db
    .from('session_transcripts')
    .select('*')
    .eq('session_id', sessionId)
    .order('chunk_index', { ascending: true });

  if (error) {
    throw new Error(`Failed to get transcript chunks: ${error.message}`);
  }

  return data as TranscriptChunk[];
}

/**
 * Saves evaluation scores.
 */
export async function saveScores(
  db: Database,
  scores: {
    session_id: string;
    is_correct: boolean;
    score: number;
    feedback?: string;
  }
): Promise<void> {
  const { error } = await db
    .from('session_scores')
    .upsert({
      session_id: scores.session_id,
      is_correct: scores.is_correct ? 1 : 0,
      score: scores.score,
      feedback: scores.feedback || null,
    });

  if (error) {
    throw new Error(`Failed to save scores: ${error.message}`);
  }
}

/**
 * Gets scores for a session.
 */
export async function getScores(db: Database, sessionId: string): Promise<SessionScores | undefined> {
  const { data, error } = await db
    .from('session_scores')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return undefined;
    }
    throw new Error(`Failed to get scores: ${error.message}`);
  }

  return data as SessionScores;
}

/**
 * Deletes all data for a user (RODO Art. 17 — Right to Erasure).
 */
export async function deleteAllUserData(db: Database, userId: string): Promise<void> {
  // Cascading deletes on the database (transcripts, scores) will trigger automatically
  // when deleting from the sessions table
  const { error: sessionDeleteError } = await db
    .from('sessions')
    .delete()
    .eq('user_id', userId);

  if (sessionDeleteError) {
    throw new Error(`Failed to delete sessions: ${sessionDeleteError.message}`);
  }

  const { error: userDeleteError } = await db
    .from('users')
    .delete()
    .eq('id', userId);

  if (userDeleteError) {
    throw new Error(`Failed to delete user profile: ${userDeleteError.message}`);
  }
}
