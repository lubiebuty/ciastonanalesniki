const fs = require('fs');
const path = require('path');
const pdfMeta = require('../public/fiszki_zagrywki/pdf_meta.json');

const sqlPath = path.resolve(__dirname, '../Playbook_Wszystkie_Pytania_i_Statystyki.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const regex = /\('([^']+)', \d+, '([^']+)', '[^']+', '([^']+)', '[^']+', '[^']+', '[^']+', 'The Playbook', (\d+), '([^']+)', '([A-C])', (\d+), '[^']*', '([^']+)'/g;

let match;
const topics = [];
while ((match = regex.exec(sql)) !== null) {
  topics.push({
    id_slug: match[8],
    dzial_numer: parseInt(match[4]),
    pytanie: match[2]
  });
}

const map = {};

topics.forEach(t => {
  const m = t.id_slug.match(/^(playbook-chap\d+-play\d+)-var[A-Z]$/);
  if (!m) return;
  const baseSlug = m[1];
  
  if (!map[baseSlug]) {
    map[baseSlug] = {
      id_slug: baseSlug,
      dzial_numer: t.dzial_numer,
      pytanie: t.pytanie
    };
  }
});

const result = {};

for (const [slug, data] of Object.entries(map)) {
  const imagePath = path.resolve(__dirname, `../public/images/frejer/${slug}.jpg`);
  const hasImage = fs.existsSync(imagePath);
  
  let nameMatch = data.pytanie.match(/[„"']([^”"']+)[”"']/);
  let nameNormalized = '';
  if (nameMatch) {
    nameNormalized = nameMatch[1].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  } else {
    const theMatch = data.pytanie.match(/The [A-Z][a-zA-Z0-9' ]+/);
    if (theMatch) {
      nameNormalized = theMatch[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }
  }

  let matchedPdf = null;
  if (nameNormalized) {
    matchedPdf = Object.keys(pdfMeta).find(f => {
      const fNorm = f.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      // Ensure we only match PDFs from the correct chapter folder
      const isRightChapter = data.dzial_numer === 4 ? f.includes('1_Plays_for_the_Beginner') :
                             data.dzial_numer === 5 ? f.includes('2_Plays_for_the_Amateur') :
                             data.dzial_numer === 6 ? f.includes('3_Plays_for_the_Weekend_Warrior') :
                             data.dzial_numer === 7 ? f.includes('4_Plays_for_the_Advanced') : true;

      return fNorm.includes(nameNormalized) && isRightChapter;
    });
  }

  result[slug] = {
    image: hasImage ? `/images/frejer/${slug}.jpg` : null,
    pdf: matchedPdf ? `/fiszki_zagrywki/${matchedPdf}` : null,
    pages: matchedPdf ? pdfMeta[matchedPdf] : null
  };
}

// Write the mapping for the frontend to use
fs.writeFileSync(path.resolve(__dirname, '../src/lib/frejer_mapping.json'), JSON.stringify(result, null, 2));
console.log('Mapping generated at src/lib/frejer_mapping.json');
