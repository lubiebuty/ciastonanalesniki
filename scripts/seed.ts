/**
 * Seed script — populates Topics table from Matematyka.json
 * with correct CALOSC/FRAGMENT classification per CKE Informator.
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
  // Try multiple possible locations for the seed data
  const possiblePaths = [
    path.resolve(__dirname, '../base/matematyka.json'),
    path.resolve(__dirname, '../../base/matematyka.json'),
  ];
  
  const matematykaPath = possiblePaths.find(p => fs.existsSync(p));

  if (!matematykaPath) {
    console.error(`❌ Seed data not found. Tried:\n${possiblePaths.join('\n')}`);
    process.exit(1);
  }

  const tasks = JSON.parse(fs.readFileSync(matematykaPath, 'utf-8')) as Array<{
    numer: number;
    pytanie: string;
    odpowiedz: string;
  }>;

  const db = getDatabase();

  let count = 0;
  for (const item of tasks) {
    await upsertTopic(db, {
      numer: item.numer,
      pytanie: item.pytanie,
      odpowiedz: item.odpowiedz,
    });
    count++;
  }

  const { count: total, error } = await db
    .from('topics')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(error.message);
  }

  console.log(`✅ Seeded ${total} math topics`);
}

seed().catch(console.error);
