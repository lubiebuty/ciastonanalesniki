/**
 * Topic upsert used by the seed script — keeps `npm run seed` / `db:reset`
 * FK-safe when sessions already reference existing topic rows.
 */
import type { Database } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface TopicSeedInput {
  numer: number;
  pytanie: string;
  odpowiedz: string;
}

/**
 * Upserts a topic by its number (`numer`).
 * Reuses the existing row's id when one is found instead of a new uuidv4() per run.
 */
export async function upsertTopic(db: Database, topic: TopicSeedInput): Promise<string> {
  const { data: existing, error: findError } = await db
    .from('topics')
    .select('id')
    .eq('numer', topic.numer)
    .single();

  if (findError && findError.code !== 'PGRST116') {
    throw new Error(`Failed to check existing topic: ${findError.message}`);
  }

  const id = existing?.id ?? uuidv4();

  const { error: upsertError } = await db
    .from('topics')
    .upsert({
      id,
      numer: topic.numer,
      pytanie: topic.pytanie,
      odpowiedz: topic.odpowiedz,
    });

  if (upsertError) {
    throw new Error(`Failed to upsert topic: ${upsertError.message}`);
  }

  return id;
}
