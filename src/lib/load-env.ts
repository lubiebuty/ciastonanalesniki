/**
 * Loads .env.local for standalone scripts.
 *
 * Next.js loads env files itself, but `tsx scripts/*.ts` runs outside that, so
 * the seed and validation scripts would otherwise see no GROQ_API_KEY at all.
 */
import fs from 'fs';
import path from 'path';

export function loadLocalEnv(): void {
  const envFile = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envFile)) return;

  process.loadEnvFile(envFile);
}
