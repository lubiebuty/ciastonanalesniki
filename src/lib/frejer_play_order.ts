export const PLAY_ORDER = [
  // Chapter 4 (Beginner)
  "The SNASA",
  "The One Week To Live",
  "The Blind Date",
  "The Don't Drink That",
  "The Rumspringa",
  "The Terminator",
  "The Test Tube",
  "The Escaped Convict",
  "The European",
  "The Olympian",
  "The Author",
  "The Robot",
  "The I'm Joining The Marines",
  "The Little Orphan Barney",
  "The Fireman",
  "The Grandpa Wonka",
  "The Naked Man",
  "The Shotgun",
  "The He's Not Coming",
  
  // Chapter 5 (Amateur)
  "The My Penis Grants Wishes",
  "The Jorge Posada",
  "The Anniversary Of My Wife's Death",
  "The Mannequin",
  "Love At First Sight",
  "The Biker",
  "The Leo",
  "The Abracadabra",
  "Brian's Friend",
  "The Bionic Man",
  "The Stanley Cup",
  "The Befuddled Puppy Owner",
  "The Portrait",
  "The Ted Mosby",
  "The Jim Nacho",
  "The Confused Inheritor",
  "The Other Jonas",
  "The Chick",
  
  // Chapter 6 (Weekend Warrior)
  "The Pinocchio Puppy",
  "The Duffel Bag",
  "The Prince Akeem",
  "The Moviegoer",
  "The Lorenzo Von Matterhorn",
  "The Cool Priest",
  "The Area 69",
  "The Ghost",
  "The Rorschach",
  "The Cheap Trick",
  "The Soviet Defector",
  "The Doogie",
  "The Au Pair",
  "The Lottery",
  "The Call Barney Stinson",
  "The Missing Cat",
  "The Time Traveler",
  "The Vampire",
  "The Barney Identity",
  "The And The Sea",
  
  // Chapter 7 (Advanced)
  "The Project X",
  "The Lifeguard",
  "The Diet Guru",
  "The Deja Vu",
  "The Falling In Love",
  "The Man On This Plane",
  "The Boy In The Bubble",
  "The Mrs. Stinsfire",
  "The Bouncer",
  "The Billionaire",
  "The Trojan Lesbian",
  "The Footloose",
  "The Grieving Chicks",
  "E Pluribus Unum",
  "The Mr. President",
  "The Kidney Scheme",
  "I Can Guess Your Weight",
  "The Heimlich Maneuver",
  "Ghost Of Christmas Future",
  "The Scuba Diver"
];

export const ORDERED_NORMALIZED_TITLES = PLAY_ORDER.map(t => 
  t.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
);

export function getGameOrderIndex(title: string): number {
  const norm = title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const idx = ORDERED_NORMALIZED_TITLES.indexOf(norm);
  // Return Infinity if not found, so it goes to the end
  return idx === -1 ? Infinity : idx;
}
