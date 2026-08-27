/**
 * Health check logic for verifying AI model availability and DB connectivity.
 *
 * Ticket 08: checkHealth now also verifies the SQLite database is reachable
 * by running `SELECT 1`. The result distinguishes between three failure causes:
 * baza (DB), stt (speech-to-text model), llm (language model).
 */
import { getConfig } from './config';
import type { Database } from './db';

export interface ModelStatus {
  ok: boolean;
  model: string;
  error?: string;
}

export interface DatabaseStatus {
  ok: boolean;
  error?: string;
}

export interface HealthResult {
  status: 'healthy' | 'unhealthy';
  stt: ModelStatus;
  llm: ModelStatus;
  db: DatabaseStatus;
  timestamp: string;
}

async function checkModel(
  apiKey: string,
  modelId: string
): Promise<ModelStatus> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models/' + modelId, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        model: modelId,
        error: diagnose(modelId, response.status, response.statusText),
      };
    }

    return { ok: true, model: modelId };
  } catch (error) {
    return {
      ok: false,
      model: modelId,
      error: `Failed to reach Groq API for model ${modelId}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Ticket 08: Checks database connectivity by executing a lightweight query.
 */
function checkDatabase(db?: Database): DatabaseStatus {
  if (!db) {
    // No DB provided — skip the check (backward-compatible for tests that
    // don't care about the DB status)
    return { ok: true };
  }

  try {
    db.prepare('SELECT 1').get();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: `Błąd połączenia z bazą danych: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Turns an HTTP status into the actual cause.
 *
 * Ticket 01 exists because Groq and Gemini retire model generations every few
 * months — that is the 404. Reporting every failure as a retirement would send
 * whoever is on call hunting through the model list for what is really a bad
 * key or a rate limit.
 */
function diagnose(modelId: string, status: number, statusText: string): string {
  if (status === 404) {
    return `Model ${modelId} nie istnieje (404). Prawdopodobnie został wycofany — sprawdź aktualną listę modeli Groq i zaktualizuj zmienną środowiskową.`;
  }
  if (status === 401 || status === 403) {
    return `Groq odrzucił uwierzytelnienie (${status}) przy sprawdzaniu modelu ${modelId}. Sprawdź GROQ_API_KEY — to nie jest problem z samym modelem.`;
  }
  if (status === 429) {
    return `Przekroczono limit zapytań do Groq (429) przy modelu ${modelId}. Model jest dostępny — spróbuj ponownie później.`;
  }
  return `Model ${modelId} zwrócił ${status} ${statusText}.`;
}

/**
 * Checks health of both STT and LLM models and (optionally) the database.
 *
 * Ticket 08: accepts an optional `db` parameter so the database connectivity
 * check can be performed. The result distinguishes between three failure
 * causes: baza (db), stt (speech model), llm (language model).
 */
export async function checkHealth(db?: Database): Promise<HealthResult> {
  const config = getConfig();

  const [stt, llm] = await Promise.all([
    checkModel(config.groqApiKey, config.groqSttModel),
    checkModel(config.groqApiKey, config.groqLlmModel),
  ]);

  const dbStatus = checkDatabase(db);

  return {
    status: stt.ok && llm.ok && dbStatus.ok ? 'healthy' : 'unhealthy',
    stt,
    llm,
    db: dbStatus,
    timestamp: new Date().toISOString(),
  };
}
