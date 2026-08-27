/**
 * Session Detail API — GET returns session details joined with its topic.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { requireAuth, requireSessionOwner } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.response;

    const { sessionId } = await params;
    const db = getDatabase();

    const ownerResult = requireSessionOwner(db, sessionId, authResult.userId);
    if (!ownerResult.ok) return ownerResult.response;

    const sessionWithTopic = db
      .prepare(
        `SELECT s.id, s.status, s.topic_id, t.numer, t.pytanie, t.odpowiedz 
         FROM sessions s 
         JOIN topics t ON s.topic_id = t.id 
         WHERE s.id = ?`
      )
      .get(sessionId);

    return NextResponse.json({ session: sessionWithTopic });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
