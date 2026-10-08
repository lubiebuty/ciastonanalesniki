const fs = require('fs');

const path = 'data/frejer.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

let maxNumer = Math.max(...data.map(d => d.numer));

const newPlays = [
  // Amateur (Dzial 5)
  { dzial_numer: 5, dzial_nazwa: "Plays for the Amateur", playIdx: 1, name: "The Lorenzo Von Matterhorn", variants: [
    { v: "A", q: "Kim jest Lorenzo Von Matterhorn?", a: "Lorenzo to fikcyjna postać, bogaty odkrywca i miliarder o fałszywym życiorysie stworzonym w internecie." },
    { v: "B", q: "Jakie są kroki, aby zastosować zagrywkę The Lorenzo Von Matterhorn?", a: "Należy stworzyć fałszywe strony internetowe z artykułami o sobie, następnie podejść do ofiary, podać się za Lorenzo i zasugerować jej sprawdzenie nazwiska w Google." },
    { v: "C", q: "Zbuduj pełną fałszywą tożsamość opierając się na The Lorenzo Von Matterhorn i podaj potencjalne luki.", a: "Wymaga zaawansowanej wiedzy IT, fałszywych stron Forbes i fałszywych newsów. Luką jest to, że ktoś z branży może od razu zauważyć, że strony są fake'owe." }
  ]},
  { dzial_numer: 5, dzial_nazwa: "Plays for the Amateur", playIdx: 2, name: "The Ted Mosby", variants: [
    { v: "A", q: "Czym charakteryzuje się taktyka The Ted Mosby?", a: "Polega na zbyt szybkim wyznaniu miłości na pierwszej randce, mówiąc 'Kocham Cię'." },
    { v: "B", q: "Dlaczego The Ted Mosby jest nazywana taktyką 'Amateur'?", a: "Ponieważ zazwyczaj odstrasza kobiety zamiast je przyciągać, jest błędem popełnianym przez nadmiernie zaangażowanych nowicjuszy." },
    { v: "C", q: "W jakich rzadkich sytuacjach The Ted Mosby mogłoby zadziałać?", a: "Kiedy druga osoba jest równie zdesperowana lub ma obsesję na punkcie szybkiego ustatkowania się, choć to wysoce nieprawdopodobne." }
  ]},

  // Weekend Warrior (Dzial 6)
  { dzial_numer: 6, dzial_nazwa: "Plays for the Weekend Warrior", playIdx: 1, name: "The Scuba Diver", variants: [
    { v: "A", q: "W co musi być wyposażony gracz stosujący taktykę The Scuba Diver?", a: "Musi posiadać pełny kombinezon płetwonurka ze sprzętem." },
    { v: "B", q: "Jaki jest główny cel taktyki The Scuba Diver w klubie?", a: "Zwrócenie na siebie absolutnej, wręcz absurdalnej uwagi wszystkich w klubie poprzez całkowicie nieodpowiedni strój." },
    { v: "C", q: "Wyjaśnij psychologiczny mechanizm zaskoczenia za taktyką The Scuba Diver.", a: "Pojawienie się w rynsztunku płetwonurka w barze wywołuje zjawisko 'pattern interrupt' - całkowicie niszczy oczekiwania społeczne, zmuszając ofiarę do zaciekawienia." }
  ]},
  { dzial_numer: 6, dzial_nazwa: "Plays for the Weekend Warrior", playIdx: 2, name: "The He's Not Coming", variants: [
    { v: "A", q: "Na czym polega The He's Not Coming?", a: "Na staniu obok atrakcyjnej kobiety czekającej na kogoś i powiedzeniu z przekonaniem 'On nie przyjdzie'." },
    { v: "B", q: "Jaką przewagę daje The He's Not Coming na randkach w ciemno?", a: "Uderza w niepewność kobiety czekającej na faceta z Tindera, przejmując inicjatywę w jej najsłabszym momencie." },
    { v: "C", q: "Zanalizuj potencjalne ryzyko w The He's Not Coming.", a: "Ryzykiem jest to, że prawdziwy partner przyjdzie w trakcie podrywu, co doprowadzi do natychmiastowej konfrontacji i zdemaskowania blefu." }
  ]},

  // Advanced (Dzial 7)
  { dzial_numer: 7, dzial_nazwa: "Plays for the Advanced Don Juan", playIdx: 1, name: "The Time Traveler", variants: [
    { v: "A", q: "Jaki jest główny rekwizyt w taktyce The Time Traveler?", a: "Brak specyficznego rekwizytu fizycznego, liczy się desperacki, zdezorientowany sposób bycia i udawanie przybysza z przyszłości." },
    { v: "B", q: "Jak poprawnie zainicjować rozmowę jako Podróżnik w Czasie?", a: "Należy podbiec, spytać z paniką 'Który mamy rok?!', odetchnąć z ulgą i powiedzieć, że trzeba ją natychmiast uwieść, żeby ocalić przyszłość." },
    { v: "C", q: "Dlaczego The Time Traveler wymaga zaawansowanych umiejętności aktorskich?", a: "Ponieważ najmniejszy uśmiech czy brak pewności siebie w głosie niszczy całą iluzję absurdalnej, komediowej historii." }
  ]},
  { dzial_numer: 7, dzial_nazwa: "Plays for the Advanced Don Juan", playIdx: 2, name: "The Robin", variants: [
    { v: "A", q: "Z ilu kroków składa się taktyka The Robin?", a: "Składa się z 16 bardzo skomplikowanych i długoterminowych kroków." },
    { v: "B", q: "Jaki jest ostateczny cel zagrywki The Robin?", a: "Oświadczenie się i poślubienie ofiary (Robin)." },
    { v: "C", q: "Omów dekonstrukcję klasycznego PUA w The Robin.", a: "The Robin całkowicie zaprzecza szybkiemu podrywowi. Wymaga miesięcy planowania, kłamania i zmuszania ofiary do wyznania uczuć w skrajnych emocjach, będąc bardziej manifestem miłości niż sztuczką." }
  ]}
];

newPlays.forEach(play => {
  play.variants.forEach((v, index) => {
    maxNumer++;
    const item = {
      id: "uuid-" + maxNumer,
      numer: maxNumer,
      pytanie: v.q,
      odpowiedz: v.a,
      elementy_kluczowe: [],
      elementy_uzupelniajace: "brak",
      odpowiedz_czesciowa: "częściowa",
      odpowiedz_bledna: "błędna",
      przedmiot: "The Playbook",
      dzial_numer: play.dzial_numer,
      dzial_nazwa: play.dzial_nazwa,
      wariant: v.v,
      numer_pytania: index + 1,
      notatka: "",
      id_slug: `playbook-chap${play.dzial_numer}-play${play.playIdx}-var${v.v}`,
      stats_json: {
        success_rate: "N/A",
        attracts: "N/A",
        requirements: "N/A",
        prep_time: "N/A"
      }
    };
    data.push(item);
  });
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Added ' + (newPlays.length * 3) + ' items.');
