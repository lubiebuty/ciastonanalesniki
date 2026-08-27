/**
 * Sandbox Evaluation API — runs math evaluation directly from manual inputs
 */
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { evaluateSession } from '@/lib/llm';
import { traceEvaluation, flushLangfuse } from '@/lib/langfuse';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topicId, userAnswer } = body;

    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 });
    }

    const db = getDatabase();
    
    // Get topic details
    const { data: topic, error: topicError } = await db
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .single();

    if (topicError || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const startedAt = Date.now();
    // Call LLM for raw scores
    const rawResult = await evaluateSession({
      pytanie: topic.pytanie,
      expectedAnswer: topic.odpowiedz,
      userAnswer: userAnswer || '',
    });

    // Trace the sandbox evaluation
    traceEvaluation({
      sessionId: `sandbox-${topicId}-${Date.now()}`,
      userId: 'sandbox-user',
      topicId,
      pytanie: topic.pytanie,
      expectedAnswer: topic.odpowiedz,
      modelId: rawResult.model,
      input: userAnswer || '',
      scores: {
        is_correct: rawResult.is_correct,
        score: rawResult.score,
      },
      feedback: rawResult.feedback,
      usage: rawResult.usage,
      durationMs: Date.now() - startedAt,
    });

    await flushLangfuse();

    return NextResponse.json({
      raw: rawResult,
      scores: {
        is_correct: rawResult.is_correct,
        score: rawResult.score,
      },
      feedback: rawResult.feedback,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Evaluation failed' },
      { status: 500 }
    );
  }
}
