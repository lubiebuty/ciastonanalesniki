import { describe, it, expect } from 'vitest';
import { buildEvaluationTrace, buildQuestionTrace } from '@/lib/langfuse';

describe('Langfuse trace builders', () => {
  it('builds evaluation trace with userId, sessionId, input context, output results, and scores', () => {
    const payload = buildEvaluationTrace({
      sessionId: 'session-123',
      userId: 'user-456',
      topicId: 'topic-789',
      pytanie: 'Ile to 2+2?',
      expectedAnswer: '4',
      modelId: 'llama-3.3-70b-versatile',
      input: 'Odpowiedź to 4',
      scores: {
        is_correct: true,
        score: 10,
      },
      feedback: 'Doskonale!',
      durationMs: 120,
    });

    expect(payload.trace.sessionId).toBe('session-123');
    expect(payload.trace.userId).toBe('user-456');
    expect(payload.trace.input).toEqual({
      pytanie: 'Ile to 2+2?',
      expectedAnswer: '4',
      userAnswer: 'Odpowiedź to 4',
    });
    expect(payload.trace.output).toEqual({
      is_correct: true,
      score: 10,
      feedback: 'Doskonale!',
    });
    expect(payload.trace.tags).toEqual(['passed', 'score-10']);
    expect(payload.trace.metadata.sessionId).toBe('session-123');
    expect(payload.trace.metadata.userId).toBe('user-456');
    expect(payload.trace.metadata.topicId).toBe('topic-789');
    expect(payload.trace.metadata.modelId).toBe('llama-3.3-70b-versatile');
    expect(payload.trace.metadata.is_correct).toBe(true);
    expect(payload.trace.metadata.score).toBe(10);
    expect(payload.trace.metadata.feedback).toBe('Doskonale!');
    expect(payload.scores).toHaveLength(2);
    expect(payload.scores?.[0]).toEqual({
      name: 'score',
      value: 10,
      comment: 'Zaliczone',
    });
    expect(payload.scores?.[1]).toEqual({
      name: 'is_correct',
      value: 1,
      comment: 'true',
    });
  });

  it('builds question trace with userId and sessionId', () => {
    const payload = buildQuestionTrace({
      sessionId: 'session-abc',
      userId: 'user-xyz',
      topicId: 'topic-1',
      modelId: 'llama-3.3-70b-versatile',
      input: 'Generuj',
      questions: ['Pytanie 1'],
    });

    expect(payload.trace.sessionId).toBe('session-abc');
    expect(payload.trace.userId).toBe('user-xyz');
    expect(payload.trace.metadata.sessionId).toBe('session-abc');
    expect(payload.trace.metadata.userId).toBe('user-xyz');
  });
});
