const fs = require('fs');
const path = require('path');
const pdfMetaRaw = require('../public/fiszki_zagrywki/pdf_meta.json');
const frejerData = require('../data/frejer.json');

const pdfMeta = pdfMetaRaw;
const AVAILABLE_FLASHCARDS = Object.keys(pdfMeta);

function getFlashcardImagePath(topic) {
  if (!topic || !topic.pytanie) return null;
  const nameMatch = topic.pytanie.match(/[„"]([^”"]+)[”"]/);
  if (!nameMatch) return null;
  const name = nameMatch[1];
  const nameNormalized = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  const matchedFile = AVAILABLE_FLASHCARDS.find(f => {
    const fNormalized = f.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const isRightChapter = topic.dzial_numer === 4 ? f.includes('1_Plays_for_the_Beginner') :
                           topic.dzial_numer === 5 ? f.includes('2_Plays_for_the_Amateur') :
                           topic.dzial_numer === 6 ? f.includes('3_Plays_for_the_Weekend_Warrior') :
                           topic.dzial_numer === 7 ? f.includes('4_Plays_for_the_Advanced') : true;
                           
    return fNormalized.includes(nameNormalized) && isRightChapter;
  });
  
  return matchedFile ? matchedFile : null;
}

const mismatches = [];
for (const topic of frejerData) {
  const file = getFlashcardImagePath(topic);
  const nameMatch = topic.pytanie.match(/[„"]([^”"]+)[”"]/);
  if (nameMatch) {
    console.log(`"${nameMatch[1]}" -> ${file}`);
  }
}
