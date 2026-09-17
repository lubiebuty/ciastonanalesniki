const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envFile = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

// Simple RFC 4180 CSV parser
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentVal += '"';
          i++; // skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentVal);
        currentVal = '';
      } else if (char === '\r') {
        // ignore CR
      } else if (char === '\n') {
        currentRow.push(currentVal);
        rows.push(currentRow);
        currentRow = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal);
    rows.push(currentRow);
  }
  return rows;
}

const PARTIA_TO_DZIAL_NUMER = {
  '1': 1,
  '2': 2,
  '3a': 3,
  '3b': 4,
  '4': 5,
  '5a': 6,
  '5b': 7,
  '6': 8,
  '7': 9,
  '8': 10,
};

async function main() {
  const csvContent = fs.readFileSync(path.resolve(__dirname, '../data/chemia.csv'), 'utf-8');
  const allRows = parseCSV(csvContent);
  const header = allRows[0];
  const dataRows = allRows.slice(1).filter((r) => r.length > 1 && r[0].trim() !== '');

  console.log(`Parsed ${dataRows.length} rows from CSV`);

  const crypto = require('crypto');
  const topics = dataRows.map((row) => {
    // id,kod,przedmiot,partia_numer,partia_tytul,zagadnienie,wariant,numer_pytania,streszczenie_pytania,pytanie,odpowiedz_wzorcowa,notatka
    const [
      idStr,
      kod,
      przedmiot,
      partia_numer,
      partia_tytul,
      zagadnienie,
      wariant,
      numer_pytania_str,
      streszczenie,
      pytanie,
      odpowiedz,
      notatka,
    ] = row;

    const idNum = parseInt(idStr, 10);
    const numer = 500 + idNum; // 501..648
    const dzialNumer = PARTIA_TO_DZIAL_NUMER[partia_numer.trim()] || parseInt(partia_numer, 10);

    return {
      id: crypto.randomUUID(),
      numer,
      pytanie: pytanie.trim(),
      odpowiedz: odpowiedz.trim(),
      przedmiot: 'chemia',
      dzial_numer: dzialNumer,
      dzial_nazwa: partia_tytul.trim(),
      wariant: wariant.trim(),
      numer_pytania: parseInt(numer_pytania_str, 10) || 1,
      notatka: notatka ? notatka.trim() : null,
      id_slug: kod.trim(),
    };
  });

  // Save to JSON
  fs.writeFileSync(
    path.resolve(__dirname, '../data/chemia.json'),
    JSON.stringify(topics, null, 2),
    'utf-8'
  );
  console.log(`Saved ${topics.length} topics to data/chemia.json`);

  // Upload to Supabase
  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('No Supabase credentials found, skipping database insert.');
    return;
  }

  const client = createClient(supabaseUrl, supabaseKey);

  console.log('Inserting topics into Supabase...');
  // Insert in batches of 25
  const BATCH_SIZE = 25;
  for (let i = 0; i < topics.length; i += BATCH_SIZE) {
    const batch = topics.slice(i, i + BATCH_SIZE);
    const { error } = await client.from('topics').upsert(batch, { onConflict: 'numer' });
    if (error) {
      console.error(`Error inserting batch ${i / BATCH_SIZE}:`, error.message);
    } else {
      console.log(`Uploaded batch ${i / BATCH_SIZE + 1} (${batch.length} rows)`);
    }
  }

  const { count, error: countErr } = await client
    .from('topics')
    .select('*', { count: 'exact', head: true })
    .eq('przedmiot', 'chemia');

  console.log(`✅ Total topics in database with przedmiot='chemia': ${count}`);
}

main().catch(console.error);
