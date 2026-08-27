/**
 * LLM client for question generation and evaluation.
 * Uses Groq API with structured outputs (JSON mode).
 * Model IDs from env vars — never hardcoded.
 */
import { getConfig } from './config';
import type { TokenUsage } from './langfuse';

/** What a Groq chat completion returned, alongside the text itself. */
export interface LLMCallResult {
  content: string;
  usage: TokenUsage;
  /** The model the API reports having served — may differ from the requested id. */
  model: string;
}

// ─── Question Generation (Ticket// ─── Evaluation (Math Question) ───

export interface LLMEvaluationResult {
  is_correct: boolean;
  score: number;
  feedback: string;
  usage: TokenUsage;
  model: string;
}

/**
 * Evaluates the student's math answer by comparing it to the expected answer.
 */
export async function evaluateSession(params: {
  pytanie: string;
  expectedAnswer: string;
  userAnswer: string;
}): Promise<LLMEvaluationResult> {
  const config = getConfig();

  const systemPrompt = `Jesteś doświadczonym nauczycielem i egzaminatorem matematyki.
Oceniasz odpowiedź ucznia na zadane pytanie matematyczne, porównując ją z poprawną oczekiwaną odpowiedzią.

ZASADY OCENIANIS:
1. Sprawdź, czy odpowiedź ucznia jest merytorycznie poprawna i prowadzi do właściwego wniosku.
2. Oceń tok rozumowania — nawet przy drobnym błędzie obliczeniowym uczeń może otrzymać punkty, jeśli koncepcja jest właściwa.
3. Przydziel ocenę punktową w skali 0-10:
   - 10: Całkowicie poprawna, precyzyjna i dobrze wyjaśniona odpowiedź.
   - 7-9: Odpowiedź poprawna z drobnymi nieścisłościami lub skrótami myślowymi.
   - 4-6: Uczeń rozumie koncept, ale popełnił istotne błędy obliczeniowe lub jego wyjaśnienie jest niekompletne.
   - 1-3: Odpowiedź w większości błędna, ale uczeń wykazuje minimalne zrozumienie tematu.
   - 0: Brak odpowiedzi, odpowiedź całkowicie błędna lub nie na temat.
4. Określ, czy odpowiedź uznajesz za zaliczoną (is_correct: true/false). Zazwyczaj score >= 5 oznacza zaliczenie (true).

Odpowiedz WYŁĄCZNIE w formacie JSON:
{
  "is_correct": <true/false>,
  "score": <0-10>,
  "feedback": "<szczegółowy opis oceny w języku polskim sformatowany w formacie Markdown. Używaj nagłówków, list wypunktowanych i pogrubień. Wyjaśnij, co uczeń zrobił dobrze, a gdzie popełnił błędy względem oczekiwanej odpowiedzi. Udziel konstruktywnych wskazówek.>"
}`;

  const userPrompt = `PYTANIE: ${params.pytanie}
OCZEKIWANA ODPOWIEDŹ: ${params.expectedAnswer}

--- ODPOWIEDŹ UCZNIA ---
${params.userAnswer}

Oceń odpowiedź ucznia według powyższych kryteriów.`;

  const result = await callLLM(config, systemPrompt, userPrompt);

  try {
    const parsed = JSON.parse(result.content);
    return {
      is_correct: Boolean(parsed.is_correct),
      score: clamp(parsed.score, 0, 10),
      feedback: parsed.feedback || '',
      usage: result.usage,
      model: result.model,
    };
  } catch {
    throw new Error(
      `Failed to parse LLM evaluation response: ${result.content.slice(0, 200)}`
    );
  }
}

// ─── Groq API Call ───

async function callLLM(
  config: ReturnType<typeof getConfig>,
  systemPrompt: string,
  userPrompt: string
): Promise<LLMCallResult> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.groqApiKey}`,
    },
    body: JSON.stringify({
      model: config.groqLlmModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Groq API error ${response.status}: ${errorBody.slice(0, 300)}`
    );
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    model?: string;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };

  return {
    content: data.choices[0]?.message?.content || '',
    // Reported by the API rather than assumed, so a silent server-side model
    // substitution shows up in the traces (ticket 12).
    model: data.model || config.groqLlmModel,
    usage: {
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
    },
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number(value) || 0));
}
