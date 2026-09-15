/**
 * Topic upsert used by the seed script — keeps `npm run seed` / `db:reset`
 * FK-safe when sessions already reference existing topic rows.
 */
import type { Database } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface Topic {
  id: string;
  numer: number;
  pytanie: string;
  odpowiedz: string;
  przedmiot?: string;
  dzial_numer?: number;
  dzial_nazwa?: string;
  wariant?: 'A' | 'B' | 'C' | 'D' | string;
  numer_pytania?: number;
  notatka?: string | null;
  id_slug?: string;
}

export interface TopicSeedInput {
  numer: number;
  pytanie: string;
  odpowiedz: string;
  przedmiot?: string;
  dzial_numer?: number;
  dzial_nazwa?: string;
  wariant?: string;
  numer_pytania?: number;
  notatka?: string | null;
  id_slug?: string;
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

  const rowData: Record<string, any> = {
    id,
    numer: topic.numer,
    pytanie: topic.pytanie,
    odpowiedz: topic.odpowiedz,
    przedmiot: topic.przedmiot ?? 'matematyka',
  };

  if (topic.dzial_numer !== undefined) rowData.dzial_numer = topic.dzial_numer;
  if (topic.dzial_nazwa !== undefined) rowData.dzial_nazwa = topic.dzial_nazwa;
  if (topic.wariant !== undefined) rowData.wariant = topic.wariant;
  if (topic.numer_pytania !== undefined) rowData.numer_pytania = topic.numer_pytania;
  if (topic.notatka !== undefined) rowData.notatka = topic.notatka;
  if (topic.id_slug !== undefined) rowData.id_slug = topic.id_slug;

  const { error: upsertError } = await db
    .from('topics')
    .upsert(rowData);

  if (upsertError) {
    throw new Error(`Failed to upsert topic: ${upsertError.message}`);
  }

  return id;
}
