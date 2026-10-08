const fs = require('fs');
const path = require('path');
// Since better-sqlite3 is not available in the sandbox easily, let's parse the SQL file
const sqlPath = path.resolve(__dirname, '../Playbook_Wszystkie_Pytania_i_Statystyki.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const regex = /\('([^']+)', \d+, '([^']+)', '[^']+', '([^']+)', '[^']+', '[^']+', '[^']+', 'The Playbook', (\d+), '([^']+)', '([A-C])', (\d+), '[^']*', '([^']+)'/g;

const allTopics = [];
let match;
while ((match = regex.exec(sql)) !== null) {
  allTopics.push({
    id: match[1],
    pytanie: match[2],
    odpowiedz_wzorcowa: match[3],
    dzial_numer: parseInt(match[4]),
    wariant: match[6],
    id_slug: match[8]
  });
}

// User's provided list in exact order
const PLAY_ORDER = {
  4: [ // Chapter 4 - 1_Plays_for_the_Beginner
    "The SNASA", "The One Week To Live", "The Blind Date", "The Don't Drink That",
    "The Rumspringa", "The Terminator", "The Test Tube", "The Escaped Convict",
    "The European", "The Olympian", "The Author", "The Robot",
    "The I'm Joining The Marines", "The Little Orphan Barney", "The Fireman",
    "The Grandpa Wonka", "The Naked Man", "The Shotgun", "The He's Not Coming"
  ],
  5: [ // Chapter 5 - 2_Plays_for_the_Amateur
    "The My Penis Grants Wishes", "The Jorge Posada", "The Anniversary Of My Wife's Death",
    "The Mannequin", "Love At First Sight", "The Biker", "The Leo", "The Abracadabra",
    "Brian's Friend", "The Bionic Man", "The Stanley Cup", "The Befuddled Puppy Owner",
    "The Portrait", "The Ted Mosby", "The Jim Nacho", "The Confused Inheritor",
    "The Other Jonas", "The Chick"
  ],
  6: [ // Chapter 6 - 3_Plays_for_the_Weekend_Warrior
    "The Pinocchio Puppy", "The Duffel Bag", "The Prince Akeem", "The Moviegoer",
    "The Lorenzo Von Matterhorn", "The Cool Priest", "The Area 69", "The Ghost",
    "The Rorschach", "The Cheap Trick", "The Soviet Defector", "The Doogie",
    "The Au Pair", "The Lottery", "The Call Barney Stinson", "The Missing Cat",
    "The Time Traveler", "The Vampire", "The Barney Identity", "The And The Sea"
  ],
  7: [ // Chapter 7 - 4_Plays_for_the_Advanced
    "The Project X", "The Lifeguard", "The Diet Guru", "The Deja Vu",
    "The Falling In Love", "The Man On This Plane", "The Boy In The Bubble",
    "The Mrs. Stinsfire", "The Bouncer", "The Billionaire", "The Trojan Lesbian",
    "The Footloose", "The Grieving Chicks", "E Pluribus Unum", "The Mr. President",
    "The Kidney Scheme", "I Can Guess Your Weight", "The Heimlich Maneuver",
    "Ghost Of Christmas Future", "The Scuba Diver"
  ]
};

const normalizeTitle = (t) => t.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

// Get the actual folders in fiszki_zagrywki
const fiszkiPath = path.resolve(__dirname, '../public/fiszki_zagrywki');
const chapters = fs.readdirSync(fiszkiPath).filter(f => fs.statSync(path.join(fiszkiPath, f)).isDirectory());

const finalMapping = {};

// We will also output a report of mapping
for (const dzialStr of Object.keys(PLAY_ORDER)) {
  const dzialNumer = parseInt(dzialStr);
  const chapterFolder = chapters.find(c => c.startsWith(`${dzialNumer - 3}_`));
  if (!chapterFolder) continue;
  
  const gamesInFolder = fs.readdirSync(path.join(fiszkiPath, chapterFolder)).filter(f => fs.statSync(path.join(fiszkiPath, chapterFolder, f)).isDirectory());
  
  // Find topics for this chapter
  const dzialTopics = allTopics.filter(t => t.dzial_numer === dzialNumer);
  
  // Group topics by their base id_slug
  const topicsBySlug = {};
  dzialTopics.forEach(t => {
    const m = t.id_slug.match(/^(playbook-chap\d+-play\d+)/);
    if (!m) return;
    const base = m[1];
    if (!topicsBySlug[base]) topicsBySlug[base] = [];
    topicsBySlug[base].push(t);
  });
  
  // We need to match each play in the PLAY_ORDER to a folder and to topics.
  PLAY_ORDER[dzialNumer].forEach((playName, index) => {
    const normName = normalizeTitle(playName);
    
    // Find matching folder
    let folderName = gamesInFolder.find(f => normalizeTitle(f) === normName);
    if (!folderName) folderName = gamesInFolder.find(f => normalizeTitle(f).includes(normName) || normName.includes(normalizeTitle(f)));
    
    // Find matching topics
    // We will look through topicsBySlug and see which one has Variant A with matching title
    let matchedSlug = null;
    for (const [slug, tList] of Object.entries(topicsBySlug)) {
      const varA = tList.find(t => t.wariant === 'A');
      if (varA) {
        let nameMatch = varA.pytanie.match(/[„"']([^”"']+)[”"']/);
        let title = nameMatch ? nameMatch[1] : null;
        if (!title) {
          const theMatch = varA.pytanie.match(/The [A-Z][a-zA-Z0-9' ]+/);
          title = theMatch ? theMatch[0] : null;
        }
        if (title && (normalizeTitle(title) === normName || normalizeTitle(title).includes(normName) || normName.includes(normalizeTitle(title)))) {
          matchedSlug = slug;
          break;
        }
      }
    }
    
    if (!folderName) {
      console.log(`WARNING: No folder found for ${playName} in ${chapterFolder}`);
    }
    if (!matchedSlug) {
      console.log(`WARNING: No topics found for ${playName} in dzial ${dzialNumer}`);
    }
    
    // Construct the data object
    const gameData = {
      index: index + 1,
      title: playName,
      folder: folderName ? path.join(chapterFolder, folderName) : null,
      pdfPath: folderName ? `/fiszki_zagrywki/${chapterFolder}/${folderName}/${folderName}.pdf` : null,
      topics: matchedSlug ? topicsBySlug[matchedSlug] : []
    };
    
    // Write questions.json into the folder if folder exists
    if (folderName) {
      const folderPath = path.join(fiszkiPath, chapterFolder, folderName);
      fs.writeFileSync(path.join(folderPath, 'questions.json'), JSON.stringify(gameData, null, 2));
    }
    
    // Also build the master structure
    if (!finalMapping[dzialNumer]) finalMapping[dzialNumer] = [];
    finalMapping[dzialNumer].push(gameData);
  });
}

// Write the master mapping file for the frontend
fs.writeFileSync(path.resolve(__dirname, '../src/lib/games_master.json'), JSON.stringify(finalMapping, null, 2));
console.log('Successfully organized games and wrote questions.json to folders!');
