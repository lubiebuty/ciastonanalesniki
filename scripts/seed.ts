/**
 * Seed script — populates Topics table from matematyka.json & polski.json
 *
 * Usage: npx tsx scripts/seed.ts
 */
import { loadLocalEnv } from '../src/lib/load-env';
import { getDatabase } from '../src/lib/db';

// Must run before getDatabase() reads DATABASE_PATH.
loadLocalEnv();
import { upsertTopic } from '../src/lib/topics';
import fs from 'fs';
import path from 'path';

async function seed() {
  const db = getDatabase();

  // 1. Math topics
  const matematykaPaths = [
    path.resolve(__dirname, '../base/matematyka.json'),
    path.resolve(__dirname, '../../base/matematyka.json'),
  ];
  const matematykaPath = matematykaPaths.find((p) => fs.existsSync(p));

  if (matematykaPath) {
    const mathTasks = JSON.parse(fs.readFileSync(matematykaPath, 'utf-8')) as Array<{
      numer: number;
      pytanie: string;
      odpowiedz: string;
    }>;
    for (const item of mathTasks) {
      await upsertTopic(db, {
        numer: item.numer,
        pytanie: item.pytanie,
        odpowiedz: item.odpowiedz,
        przedmiot: 'matematyka',
      });
    }
  }

  // 2. Polish topics
  const polskiPaths = [
    path.resolve(__dirname, '../data/polski.json'),
    path.resolve(__dirname, '../../data/polski.json'),
  ];
  const polskiPath = polskiPaths.find((p) => fs.existsSync(p));

  if (polskiPath) {
    const polskiTasks = JSON.parse(fs.readFileSync(polskiPath, 'utf-8')) as Array<{
      numer: number;
      pytanie: string;
      odpowiedz: string;
    }>;
    for (const item of polskiTasks) {
      await upsertTopic(db, {
        numer: item.numer,
        pytanie: item.pytanie,
        odpowiedz: item.odpowiedz,
        przedmiot: 'polski',
      });
    }
  }

  const { count: total, error } = await db
    .from('topics')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(error.message);
  }

  console.log(`✅ Seeded ${total} topics total`);
}

seed().catch(console.error);
