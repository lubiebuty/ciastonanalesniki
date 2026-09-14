/**
 * Evaluate API — runs math evaluation against the expected solution.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import {
  getTranscriptChunks,
  saveScores,
  updateSessionStatus,
} from '@/lib/sessions';
import { evaluateSession } from '@/lib/llm';
import { requireAuth, requireSessionOwner } from '@/lib/api-auth';
import { traceEvaluation, flushLangfuse } from '@/lib/langfuse';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  let sessionId: string | undefined;

  try {
    const body = await request.json();
    sessionId = body.sessionId;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const db = getDatabase();

    const owner = await requireSessionOwner(db, sessionId, authResult.userId);
    if (!owner.ok) {
      return owner.response;
    }
    const session = owner.session;
    const sessionTopicId = session.topic_id;

    // Get topic details
    const { data: topic, error: topicError } = await db
      .from('topics')
      .select('*')
      .eq('id', session.topic_id)
      .single();

    if (topicError || !topic) {
      throw new Error(`Failed to fetch topic: ${topicError?.message || 'Topic not found'}`);
    }

    // Get all monologue transcript chunks (raw, unedited)
    const chunks = await getTranscriptChunks(db, sessionId);
    const userAnswer = chunks.map((c) => c.text).join(' ');

    // Update status to evaluating
    await updateSessionStatus(db, sessionId, 'evaluating');

    // Call LLM for math score comparison
    const startedAt = Date.now();
    let result: Awaited<ReturnType<typeof evaluateSession>>;
    try {
      result = await evaluateSession({
        pytanie: topic.pytanie,
        expectedAnswer: topic.odpowiedz,
        userAnswer,
        przedmiot: topic.przedmiot,
      });
    } catch (llmError) {
      await updateSessionStatus(db, sessionId, 'evaluation_failed');
      throw llmError;
    }

    // Trace evaluation to Langfuse
    traceEvaluation({
      sessionId,
      userId: authResult.userId,
      topicId: sessionTopicId,
      pytanie: topic.pytanie,
      expectedAnswer: topic.odpowiedz,
      modelId: result.model,
      input: userAnswer,
      scores: {
        is_correct: result.is_correct,
        score: result.score,
      },
      feedback: result.feedback,
      usage: result.usage,
      durationMs: Date.now() - startedAt,
    });

    // Save scores
    await saveScores(db, {
      session_id: sessionId,
      is_correct: result.is_correct,
      score: result.score,
      feedback: result.feedback,
    });

    // Mark session as completed
    await updateSessionStatus(db, sessionId, 'completed');

    await flushLangfuse();

    return NextResponse.json({
      scores: {
        is_correct: result.is_correct,
        score: result.score,
      },
      feedback: result.feedback,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Evaluation failed' },
      { status: 500 }
    );
  }
}
