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
    const result = await createSession(db, authResult.userId, topicId);

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
    const { data: rawSessions, error } = await db
      .from('sessions')
      .select(`
        id, 
        status, 
        created_at, 
        topics (
          numer,
          pytanie,
          odpowiedz
        ),
        session_scores (
          is_correct,
          score,
          feedback
        )
      `)
      .eq('user_id', authResult.userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // Map nested relations into the flat format expected by the frontend
    const sessions = (rawSessions || []).map((s: any) => {
      const topic = Array.isArray(s.topics) ? s.topics[0] : s.topics;
      const scoreObj = Array.isArray(s.session_scores) ? s.session_scores[0] : s.session_scores;

      return {
        id: s.id,
        status: s.status,
        created_at: s.created_at,
        numer: topic?.numer,
        pytanie: topic?.pytanie,
        odpowiedz: topic?.odpowiedz,
        is_correct: scoreObj?.is_correct,
        score: scoreObj?.score,
        feedback: scoreObj?.feedback,
      };
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
