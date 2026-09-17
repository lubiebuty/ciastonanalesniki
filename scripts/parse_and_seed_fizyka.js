const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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
          i++;
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
        // ignore
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

// Model answers for Partia 4 (Zjawiska cieplne) where CSV had placeholders
const PARTIA_4_ANSWERS = {
  'CIE-A01': 'Temperatura to miara średniej energii kinetycznej chaotycznego ruchu cząsteczek tworzących dane ciało — mówi o stanie cieplnym ciała i mierzy się ją w stopniach Celsjusza lub kelwinach. Ciepło natomiast to forma energii, która ulega samorzutnemu przekazaniu między ciałami (lub ich częściami) wyłącznie z powodu różnicy temperatur, od ciała o wyższej temperaturze do ciała o niższej — mierzy się je w dżulach. Temperatura jest więc cechą stanu danego ciała w danej chwili, a ciepło to ilość energii przekazywanej w procesie cieplnym.',
  'CIE-A02': 'Temperatura topniejącego lodu nie rośnie mimo dostarczania ciepła, ponieważ cała dostarczana energia cieplna jest w tym czasie zużywana na zmianę stanu skupienia (pokonanie i rozerwanie wiązań w krystalicznej sieci lodu, czyli tzw. ciepło topnienia), a nie na zwiększenie średniej energii kinetycznej cząsteczek. Dopiero po całkowitym stopieniu lodu dalsze ogrzewanie powoduje wzrost temperatury powstałej wody.',
  'CIE-B01': 'Ciepło przepływa samorzutnie od gorącej herbaty (ciała o wyższej temperaturze) do chłodniejszego otoczenia (pokoju), aż do momentu wyrównania temperatur obu ciał, czyli osiągnięcia stanu równowagi termodynamicznej (herbata ostygnie do temperatury pokojowej). Kluczowa pułapka: w fizyce nie istnieje zjawisko „przepływu zimna” — zimno nie jest wielkością fizyczną, lecz subiektywnym odczuciem braku ciepła; to zawsze energia cieplna odpływa z ciała cieplejszego do chłodniejszego.',
  'CIE-B02': 'Temperaturę w skali Kelvina obliczamy dodając do temperatury w skali Celsjusza liczbę 273,15 (w przybliżeniu 273): T = t + 273 = 20 + 273 = 293 K. Kluczowa pułapka polega na odejmowaniu zamiast dodawania liczby 273 — skala Kelvina zaczyna się od zera bezwzględnego (-273°C), więc każda dodatnia temperatura w skali Celsjusza w kelwinach ma zawsze wartość liczbową znacznie większą niż w stopniach Celsjusza.',
  'CIE-B03': 'Przykładem zmiany energii wewnętrznej przez wykonanie pracy mechanicznej jest intensywne pocieranie dłoni o siebie, zginanie metalowego drutu w tę i z powrotem, pompowanie koła rowerowego (pompka się rozgrzewa w wyniku ściskania gazu) lub uderzanie młotkiem w kawałek ołowiu. We wszystkich tych przypadkach energia wewnętrzna ciała rośnie, a jego temperatura wzrasta w wyniku wykonanej pracy mechanicznej, a nie ogrzewania nad płomieniem. Pułapka: nie wolno podawać przykładów dostarczania ciepła (np. stawiania naczynia na palniku), bo pytanie wprost wymaga wykonania pracy.',
  'CIE-B04': 'Temperatura jest miarą średniej energii kinetycznej cząsteczek, co bezpośrednio oznacza, że im wyższa temperatura, tym szybciej i bardziej intensywnie cząsteczki poruszają się i drgają w chaotycznym ruchu cieplnym. Same cząsteczki (atomy czy cząsteczki chemiczne) nie powiększają swoich wymiarów — ich rozmiar i masa pozostają bez zmian, rośnie jedynie ich prędkość oraz średnia odległość między nimi w wyniku silniejszych zderzeń (rozszerzalność cieplna). Pułapka: mylenie wzrostu temperatury ze zmianą rozmiaru pojedynczych cząsteczek.',
  'CIE-B05': 'Metalowa łyżka nagrzewa się szybciej niż drewniana, ponieważ metal jest bardzo dobrym przewodnikiem ciepła (posiada swobodne elektrony ułatwiające szybki transport energii cieplnej), podczas gdy drewno jest izolatorem cieplnym o bardzo małym współczynniku przewodnictwa. Pułapka: różnica ta wynika z właściwości samego materiału (przewodnictwa cieplnego), a nie z grubości, wielkości czy kształtu łyżki.',
  'CIE-B06': 'Grzejnik umieszcza się nisko, przy podłodze, ponieważ ogrzane przez niego powietrze rozszerza się, zmniejsza swoją gęstość (staje się lżejsze) i unosi się do góry, a na jego miejsce z góry opada powietrze chłodniejsze i gęstsze — zjawisko to nazywamy konwekcją. Dzięki temu w całym pokoju zachodzi naturalny, sprawny obieg i równomierne ogrzewanie powietrza. Pułapka: umieszczenie grzejnika pod sufitem ogrzałoby tylko warstwę pod sufitem, bo ciepłe powietrze nie opada w dół.',
  'CIE-B07': 'Podczas wrzenia wody w 100°C całe dostarczane ciepło jest zużywane na przemianę fazową — zamianę cieczy w parę wodną (tzw. ciepło parowania), czyli na zerwanie oddziaływań między cząsteczkami wody w stanie ciekłym i wykonanie pracy rozszerzania objętości. Dostarczana energia nie „znika”, lecz zwiększa energię potencjalną oddziaływań cząsteczek, dlatego temperatura pozostaje stała aż do odparowania całej cieczy. Pułapka: brak wzrostu temperatury nie oznacza braku dostarczania energii.',
  'CIE-B08': 'Prostym domowym doświadczeniem pokazującym skraplanie jest przytrzymanie zimnej pokrywki lub talerza nad gotującym się czajnikiem z parą wodną albo wyjęcie zimnej butelki z lodówki w ciepły dzień — na zimnej powierzchni natychmiast pojawiają się kropelki wody. Cząsteczki niewidocznej pary wodnej w kontakcie z zimną powierzchnią oddają ciepło, tracą energię i przechodzą ze stanu gazowego w stan ciekły. Pułapka: mylenie skraplania (zamiana pary w ciecz) z parowaniem (zamiana cieczy w parę).',
  'CIE-B09': 'Bierzemy metalowy i drewniany pręt o jednakowych wymiarach, na końcach każdego z nich mocujemy kropelką wosku małą pinezkę, a drugie końce podgrzewamy jednakowo płomieniem świeczki. Z pręta metalowego wosk stopi się znacznie szybciej i pinezka odpadnie pierwsza, ponieważ metal znacznie lepiej i szybciej przewodzi ciepło niż drewno. Doświadczenie to zapewnia obiektywne, mierzalne porównanie dzięki kontrolowanym warunkom i jednakowemu wskaźnikowi (topnienie wosku).',
  'CIE-B10': 'Doświadczenie: bierzemy drewniany klocek lub ołówek i energicznie pocieramy nim o blat stołu przez 20–30 sekund, po czym natychmiast dotykamy pocieranej powierzchni. Wyraźnie czuć, że powierzchnia stała się ciepła. Podczas tarcia siła tarcia wykonuje pracę mechaniczną przeciwko oporom ruchu, a wykonana praca zamienia się bezpośrednio w przyrost energii wewnętrznej ciał, co objawia się wzrostem ich temperatury bez udziału zewnętrznego płomienia czy grzałki.',
  'CIE-C01': 'Kostka lodu topi się w szklance wody pokojowej: na oko temperatura równowagi będzie zdecydowanie bliższa temperaturze wody (np. kilkanaście stopni Celsjusza, a nie 0°C), chyba że lodu było bardzo dużo w stosunku do wody. Wynika to z faktu, że woda pokojowa oddaje ciepło topniejącemu lodowi; ciepło przepływa na skutek różnicy temperatur, aż do momentu wyrównania temperatur i osiągnięcia stanu równowagi termicznej. Woda się ochładza, lód pobiera ciepło, topi się i zamienia w zimną wodę, a powstała mieszanina osiąga wspólną, pośrednią temperaturę.',
  'CIE-C02': 'W termosie chcemy jak najsłabszego przewodnictwa ścianek (podwójne ścianki z próżnią), aby ograniczyć do minimum ucieczkę ciepła drogą przewodzenia i konwekcji, dzięki czemu napój długo trzyma temperaturę. Z kolei metalowa łyżeczka włożona do kubka jest doskonałym przewodnikiem ciepła — ciepło z gorącej herbaty bardzo szybko przepływa wzdłuż metalowego trzonka na zewnątrz i ulatuje do otoczenia, przyspieszając stygnięcie herbaty znacznie bardziej niż łyżeczka z plastiku, który jest izolatorem.',
  'CIE-C03': 'Od 90°C do 100°C dostarczane ciepło powoduje wzrost średniej energii kinetycznej cząsteczek wody — temperatura rośnie, a energia wewnętrzna się zwiększa. W temperaturze 100°C woda osiąga temperaturę wrzenia i zaczyna gwałtownie wrzeć w całej objętości. Od tego momentu temperatura pozostaje stała na poziomie 100°C aż do całkowitego wyparowania, natomiast dostarczane ciepło w całości zamienia się w ciepło parowania, zrywając wiązania międzycząsteczkowe i zwiększając energię potencjalną cząsteczek w fazie gazowej.',
  'CIE-D01': 'Kolega popełnia błąd fizyczny. W fizyce nie istnieje zjawisko „oddawania zimna”, ponieważ zimno nie jest wielkością fizyczną ani formą energii — to ciepło jest energią przekazywaną w procesie cieplnym. Gdy dotykamy zimnej metalowej poręczy, to nasze ciepłe dłonie oddają ciepło zimnemu metalowi, a ponieważ metal świetnie przewodzi ciepło, energia odpływa z naszej skóry bardzo szybko, wywołując gwałtowne uczucie chłodu. Poprawne wyjaśnienie: ciepło zawsze płynie od ciała cieplejszego (ręka) do chłodniejszego (poręcz).',
  'CIE-D02': 'Koleżanka popełnia błąd. Dopóki w naczyniu znajduje się wrząca woda pod stałym ciśnieniem atmosferycznym, temperatura wody i powstającej pary nasyconej tuż nad nią wynosi dokładnie 100°C i nie rośnie pomimo dalszego podgrzewania. Całe dostarczane ciepło jest zużywane na zmianę stanu skupienia (parowanie), a nie na wzrost temperatury. Dopiero gdy cała woda odparuje, a powstałą parę zamkniemy i będziemy dalej ogrzewać (jako parę przegrzaną), jej temperatura będzie mogła wzrosnąć powyżej 100°C.'
};

async function main() {
  const csvPath = path.resolve(__dirname, '../data/fizyka.csv');
  const rawText = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(rawText);

  // First row is header
  const header = rows[0];
  console.log('Header:', header);

  const topics = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 9) continue;

    const idNum = parseInt(row[0]);
    const kod = row[1];
    const partiaNum = parseInt(row[2]);
    const partiaTytul = row[3];
    const zagadnienie = row[4];
    const wariant = row[5];
    const numerPytania = parseInt(row[6]);
    const pytanieSkrot = row[7];
    const pytanie = row[8];
    let odpowiedz = row[9] || '';
    const notatka = row[10] || null;

    // If answer is missing and we have it in PARTIA_4_ANSWERS
    if (!odpowiedz && PARTIA_4_ANSWERS[kod]) {
      odpowiedz = PARTIA_4_ANSWERS[kod];
    }

    const topicItem = {
      id: uuidv4(),
      numer: 700 + idNum,
      pytanie: pytanie.trim(),
      odpowiedz: odpowiedz.trim(),
      przedmiot: 'fizyka',
      dzial_numer: partiaNum,
      dzial_nazwa: partiaTytul.trim(),
      wariant: wariant.trim(),
      numer_pytania: numerPytania,
      notatka: notatka ? notatka.trim() : null,
      id_slug: kod.trim(),
    };

    topics.push(topicItem);
  }

  console.log(`Parsed ${topics.length} rows from CSV`);

  // Write to data/fizyka.json
  const jsonPath = path.resolve(__dirname, '../data/fizyka.json');
  fs.writeFileSync(jsonPath, JSON.stringify(topics, null, 2), 'utf-8');
  console.log(`Saved ${topics.length} topics to data/fizyka.json`);

  // Insert into Supabase if available
  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('No Supabase credentials found, skipping database insert.');
    return;
  }

  const client = createClient(supabaseUrl, supabaseKey);

  console.log('Attempting to insert topics into Supabase...');
  const BATCH_SIZE = 25;
  for (let i = 0; i < topics.length; i += BATCH_SIZE) {
    const batch = topics.slice(i, i + BATCH_SIZE);
    const { error } = await client.from('topics').upsert(batch, { onConflict: 'numer' });
    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
    } else {
      console.log(`Uploaded batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} rows)`);
    }
  }

  const { count } = await client
    .from('topics')
    .select('*', { count: 'exact', head: true })
    .eq('przedmiot', 'fizyka');

  console.log(`Total topics in database with przedmiot='fizyka': ${count ?? 0}`);
}

main().catch(console.error);
