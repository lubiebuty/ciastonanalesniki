const Database = require('better-sqlite3');
const path = require('path');
const pdfMeta = require('../public/fiszki_zagrywki/pdf_meta.json');
const AVAILABLE_FLASHCARDS = Object.keys(pdfMeta);

const db = new Database(path.resolve(__dirname, '../data/matura.sqlite'));

const topics = db.prepare(`SELECT * FROM topics WHERE przedmiot = 'The Playbook'`).all();

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
                           
    return fNormalized.includes(nameNormalized) && (topic.dzial_numer === 4 ? f.includes('1_Plays_for_the_Beginner') :
                           topic.dzial_numer === 5 ? f.includes('2_Plays_for_the_Amateur') :
                           topic.dzial_numer === 6 ? f.includes('3_Plays_for_the_Weekend_Warrior') :
                           topic.dzial_numer === 7 ? f.includes('4_Plays_for_the_Advanced') : true);
  });
  
  return matchedFile ? matchedFile : null;
}

for (const topic of topics) {
  if (topic.wariant === 'A' && topic.dzial_numer === 4) {
    const file = getFlashcardImagePath(topic);
    console.log(`[${topic.id_slug}] ${topic.pytanie.substring(0, 30)}... => ${file}`);
  }
}
