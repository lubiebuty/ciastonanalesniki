const frejerData = require('../data/frejer.json');
const pdfMeta = require('../public/fiszki_zagrywki/pdf_meta.json');
const AVAILABLE_FLASHCARDS = Object.keys(pdfMeta);

const map = {};

for (const topic of frejerData) {
  if (topic.wariant !== 'A') continue; // only check each play once

  let nameMatch = topic.pytanie.match(/[„"']([^”"']+)[”"']/);
  let name = '';
  
  if (nameMatch) {
    name = nameMatch[1];
  } else {
    const theMatch = topic.pytanie.match(/The [A-Z][a-zA-Z0-9' ]+/);
    if (theMatch) {
      name = theMatch[0];
    }
  }

  if (name) {
    name = name.replace(/['’]/g, ''); // remove apostrophes for matching
    const nameNormalized = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    const matchedFiles = AVAILABLE_FLASHCARDS.filter(f => {
      const parts = f.split('/');
      const filename = parts[parts.length - 1]; // e.g. "The SNASA.pdf"
      const filenameNorm = filename.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      return filenameNorm.includes(nameNormalized) || nameNormalized.includes(filenameNorm.replace('pdf', ''));
    });

    if (matchedFiles.length > 0) {
      map[topic.id_slug] = matchedFiles[0];
    } else {
      map[topic.id_slug] = null;
      console.log(`NO MATCH FOR: ${name} (slug: ${topic.id_slug})`);
    }
  } else {
    console.log(`NO NAME EXTRACTED FOR: ${topic.pytanie} (slug: ${topic.id_slug})`);
  }
}

console.log(map);
