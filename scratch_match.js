const AVAILABLE_FLASHCARDS = [
  "Rozdzial_4_Don_t_Drink_That_.jpg",
  "Rozdzial_4_He_s_Not_Coming.jpg"
];

function testMatch(name) {
  const nameNormalized = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  const matchedFile = AVAILABLE_FLASHCARDS.find(f => {
    const fNormalized = f.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return fNormalized.includes(nameNormalized);
  });
  
  console.log(`Name: ${name} -> Normalized: ${nameNormalized} -> Matched: ${matchedFile}`);
}

testMatch("Don't Drink That!");
testMatch("He's Not Coming");
