import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { saveTranscriptChunk } from '@/lib/sessions';
import { requireAuth, requireSessionOwner } from '@/lib/api-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.response;

    const { sessionId } = await params;
    const { answerText } = await request.json();

    if (answerText === undefined || answerText === null) {
      return NextResponse.json(
        { error: 'answerText is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const owner = requireSessionOwner(db, sessionId, authResult.userId);
    if (!owner.ok) return owner.response;

    // Clear prior chunks and save the final answer text as a single transcript chunk
    db.transaction(() => {
      db.prepare('DELETE FROM session_transcripts WHERE session_id = ?').run(sessionId);
      saveTranscriptChunk(db, sessionId, answerText, 0);
    })();

    return NextResponse.json({ saved: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save answer' },
      { status: 500 }
    );
  }
}
