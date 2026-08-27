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
export function upsertTopic(db: Database, topic: TopicSeedInput): string {
  const existing = db
    .prepare('SELECT id FROM topics WHERE numer = ?')
    .get(topic.numer) as { id: string } | undefined;

  const id = existing?.id ?? uuidv4();

  db.prepare(
    `INSERT OR REPLACE INTO topics (id, numer, pytanie, odpowiedz)
     VALUES (?, ?, ?, ?)`
  ).run(id, topic.numer, topic.pytanie, topic.odpowiedz);

  return id;
}
