/**
 * Environment variable configuration for AI model services.
 * All model IDs are read from env vars — no hardcoded model strings.
 */

export interface AppConfig {
  groqApiKey: string;
  groqSttModel: string;
  groqLlmModel: string;
  databasePath: string;
}

const REQUIRED_VARS = [
  'GROQ_API_KEY',
  'GROQ_STT_MODEL',
  'GROQ_LLM_MODEL',
] as const;

/**
 * Reads and validates all required environment variables.
 * Throws with a clear message if any required variable is missing.
 */
export function getConfig(): AppConfig {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        `Set them in .env.local or your deployment environment.`
    );
  }

  return {
    groqApiKey: process.env.GROQ_API_KEY!,
    groqSttModel: process.env.GROQ_STT_MODEL!,
    groqLlmModel: process.env.GROQ_LLM_MODEL!,
    databasePath: process.env.DATABASE_PATH || './data/matura.sqlite',
  };
}
