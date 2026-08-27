import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getScores } from '@/lib/sessions';
import { requireAuth, requireSessionOwner } from '@/lib/api-auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.ok) return authResult.response;

    const { sessionId } = await params;
    const db = getDatabase();
    const owner = await requireSessionOwner(db, sessionId, authResult.userId);
    if (!owner.ok) return owner.response;

    if (owner.session.status !== 'completed') {
      return NextResponse.json({
        status: owner.session.status,
        message: 'Evaluation is not yet complete',
      });
    }

    const scores = await getScores(db, sessionId);
    return NextResponse.json({ scores, status: 'completed' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}
