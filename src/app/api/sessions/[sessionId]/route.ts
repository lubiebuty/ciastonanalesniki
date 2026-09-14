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

    const ownerResult = await requireSessionOwner(db, sessionId, authResult.userId);
    if (!ownerResult.ok) return ownerResult.response;

    const { data: sessionData, error } = await db
      .from('sessions')
      .select(`
        id,
        status,
        topic_id,
        topics (
          numer,
          pytanie,
          odpowiedz,
          przedmiot
        )
      `)
      .eq('id', sessionId)
      .single();

    if (error || !sessionData) {
      throw new Error(error?.message || 'Session not found');
    }

    let topic = Array.isArray(sessionData.topics) ? sessionData.topics[0] : sessionData.topics;

    // Fallback: If join didn't populate topic or przedmiot, query topics table directly
    if ((!topic || !topic.przedmiot) && sessionData.topic_id) {
      const { data: directTopic } = await db
        .from('topics')
        .select('numer, pytanie, odpowiedz, przedmiot')
        .eq('id', sessionData.topic_id)
        .single();
      if (directTopic) {
        topic = directTopic;
      }
    }

    // Determine subject: explicit column or by question number (Polish tasks start at 51)
    let przedmiot = topic?.przedmiot;
    if (!przedmiot) {
      if (topic?.numer && topic.numer >= 51) {
        przedmiot = 'polski';
      } else {
        przedmiot = 'matematyka';
      }
    }

    const sessionWithTopic = {
      id: sessionData.id,
      status: sessionData.status,
      topic_id: sessionData.topic_id,
      numer: topic?.numer,
      pytanie: topic?.pytanie,
      odpowiedz: topic?.odpowiedz,
      przedmiot,
    };

    return NextResponse.json({ session: sessionWithTopic });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
