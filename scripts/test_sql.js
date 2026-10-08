const fs = require('fs');
const path = require('path');
const pdfMeta = require('../public/fiszki_zagrywki/pdf_meta.json');
const AVAILABLE_FLASHCARDS = Object.keys(pdfMeta);

const sqlPath = path.resolve(__dirname, '../Playbook_Wszystkie_Pytania_i_Statystyki.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const regex = /\('([^']+)', \d+, '([^']+)', '[^']+', '([^']+)', '[^']+', '[^']+', '[^']+', 'The Playbook', (\d+), '([^']+)', '([A-C])', (\d+), '[^']*', '([^']+)'/g;

let match;
const topics = [];
while ((match = regex.exec(sql)) !== null) {
  topics.push({
    id: match[1],
    pytanie: match[2],
    dzial_numer: parseInt(match[4]),
    wariant: match[6],
    id_slug: match[8]
  });
}

function getFlashcardImagePath(topic) {
  if (!topic || !topic.pytanie) return null;
  const nameMatch = topic.pytanie.match(/[„"']([^”"']+)[”"']/);
  let nameNormalized = '';
  if (nameMatch) {
    nameNormalized = nameMatch[1].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  } else {
    const theMatch = topic.pytanie.match(/The [A-Z][a-zA-Z0-9' ]+/);
    if (theMatch) {
      nameNormalized = theMatch[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }
  }

  if (!nameNormalized) return null;

  const matchedFile = AVAILABLE_FLASHCARDS.find(f => {
    const fNormalized = f.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const isRightChapter = topic.dzial_numer === 4 ? f.includes('1_plays_for_the_beginner') :
                           topic.dzial_numer === 5 ? f.includes('2_plays_for_the_amateur') :
                           topic.dzial_numer === 6 ? f.includes('3_plays_for_the_weekend_warrior') :
                           topic.dzial_numer === 7 ? f.includes('4_plays_for_the_advanced') : true;
                           
    return fNormalized.includes(nameNormalized) && isRightChapter;
  });
  
  return matchedFile ? matchedFile : null;
}

for (const topic of topics) {
  if (topic.wariant === 'A' && topic.dzial_numer === 4) {
    const file = getFlashcardImagePath(topic);
    console.log(`[${topic.id_slug}] ${topic.pytanie.substring(0, 30)}... => ${file}`);
  }
}
