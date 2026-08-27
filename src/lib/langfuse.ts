/**
 * Langfuse observability for the two prompt-chain touchpoints (Ticket 12):
 * question generation (ticket 06) and 4-criteria evaluation (ticket 08).
 *
 * Payload construction is kept pure and separate from transmission, so the
 * metadata contract can be tested without a network call or API keys.
 *
 * Every trace carries session_id, topic_id and the model ID actually used —
 * Groq and Gemini retire model generations every few months, and when a
 * rotation breaks scoring these traces are what makes it diagnosable after
 * the fact.
 */
import { Langfuse } from 'langfuse';

let langfuseClient: Langfuse | null = null;

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface TraceScore {
  name: string;
  value: number;
  comment?: string;
}

export interface TracePayload {
  trace: {
    name: string;
    sessionId?: string;
    userId?: string;
    input?: unknown;
    output?: unknown;
    tags?: string[];
    metadata: Record<string, unknown>;
  };
  generation: {
    name: string;
    model: string;
    input: string;
    output: string;
    usage: TokenUsage;
    metadata: Record<string, unknown>;
  };
  scores?: TraceScore[];
}

const NO_USAGE: TokenUsage = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
};

/**
 * Returns the shared client, or null when Langfuse is not configured.
 * Tracing is strictly optional — a missing key must never break an exam.
 */
export function getLangfuse(): Langfuse | null {
  if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) {
    return null;
  }

  if (!langfuseClient) {
    langfuseClient = new Langfuse({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      baseUrl: process.env.LANGFUSE_BASEURL || 'https://cloud.langfuse.com',
    });
  }

  return langfuseClient;
}

// ─── Payload builders (pure) ───

export function buildQuestionTrace(params: {
  sessionId: string;
  userId?: string;
  topicId: string;
  modelId: string;
  input: string;
  questions: string[];
  usage?: TokenUsage;
  durationMs?: number;
}): TracePayload {
  const shared = {
    sessionId: params.sessionId,
    userId: params.userId,
    topicId: params.topicId,
    modelId: params.modelId,
  };

  return {
    trace: {
      name: 'question-generation',
      sessionId: params.sessionId,
      userId: params.userId,
      input: params.input,
      output: params.questions,
      metadata: {
        ...shared,
        question_count: params.questions.length,
        duration_ms: params.durationMs,
      },
    },
    generation: {
      name: 'generate-commission-questions',
      model: params.modelId,
      input: params.input,
      output: JSON.stringify(params.questions),
      usage: params.usage ?? NO_USAGE,
      metadata: shared,
    },
  };
}

export function buildEvaluationTrace(params: {
  sessionId: string;
  userId?: string;
  topicId: string;
  pytanie?: string;
  expectedAnswer?: string;
  modelId: string;
  input: string;
  scores: {
    is_correct: boolean;
    score: number;
  };
  feedback?: string;
  usage?: TokenUsage;
  durationMs?: number;
}): TracePayload {
  const shared = {
    sessionId: params.sessionId,
    userId: params.userId,
    topicId: params.topicId,
    modelId: params.modelId,
  };

  const evaluationResult = {
    is_correct: params.scores.is_correct,
    score: params.scores.score,
    feedback: params.feedback || '',
  };

  const traceInput = {
    pytanie: params.pytanie,
    expectedAnswer: params.expectedAnswer,
    userAnswer: params.input,
  };

  return {
    trace: {
      name: 'evaluation-math',
      sessionId: params.sessionId,
      userId: params.userId,
      input: traceInput,
      output: evaluationResult,
      tags: [
        params.scores.is_correct ? 'passed' : 'failed',
        `score-${params.scores.score}`,
      ],
      metadata: {
        ...shared,
        ...evaluationResult,
        duration_ms: params.durationMs,
      },
    },
    generation: {
      name: 'evaluate-math',
      model: params.modelId,
      input: params.input,
      output: JSON.stringify(evaluationResult),
      usage: params.usage ?? NO_USAGE,
      metadata: shared,
    },
    scores: [
      {
        name: 'score',
        value: params.scores.score,
        comment: params.scores.is_correct ? 'Zaliczone' : 'Do poprawy',
      },
      {
        name: 'is_correct',
        value: params.scores.is_correct ? 1 : 0,
        comment: params.scores.is_correct ? 'true' : 'false',
      },
    ],
  };
}

// ─── Transmission ───

/** Sends a built payload. Silently no-ops when Langfuse is not configured. */
export function sendTrace(payload: TracePayload): void {
  const langfuse = getLangfuse();
  if (!langfuse) return;

  try {
    const trace = langfuse.trace(payload.trace);
    trace.generation(payload.generation);
    if (payload.scores) {
      for (const score of payload.scores) {
        trace.score(score);
      }
    }
  } catch (error) {
    // Observability must never take down the exam flow.
    console.error('Langfuse trace failed:', error);
  }
}

export function traceQuestionGeneration(
  params: Parameters<typeof buildQuestionTrace>[0]
): void {
  sendTrace(buildQuestionTrace(params));
}

export function traceEvaluation(
  params: Parameters<typeof buildEvaluationTrace>[0]
): void {
  sendTrace(buildEvaluationTrace(params));
}

/** Flush pending traces before the serverless invocation ends. */
export async function flushLangfuse(): Promise<void> {
  const langfuse = getLangfuse();
  if (!langfuse) return;

  try {
    await langfuse.flushAsync();
  } catch (error) {
    console.error('Langfuse flush failed:', error);
  }
}
