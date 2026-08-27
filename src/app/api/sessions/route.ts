/**
 * Sessions API — POST creates a new session (deducts token).
 *
 * Ticket 01: uses requireAuth() instead of auth() directly, so the age-gate
 * is enforced here too (unconfirmed users get 403 before any token is touched).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { createSession } from '@/lib/sessions';
import { requireAuth } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.response;

    const body = await request.json();
    const { topicId } = body;

    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 });
    }

    const db = getDatabase();
    const result = createSession(db, authResult.userId, topicId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 402 });
    }

    return NextResponse.json({ session: result.session }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.response;

    const db = getDatabase();
    const sessions = db
      .prepare(`
        SELECT 
          s.id, 
          s.status, 
          s.created_at, 
          t.numer,
          t.pytanie,
          t.odpowiedz,
          sc.is_correct,
          sc.score,
          sc.feedback
        FROM sessions s
        JOIN topics t ON s.topic_id = t.id
        LEFT JOIN session_scores sc ON s.id = sc.session_id
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
      `)
      .all(authResult.userId);

    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
