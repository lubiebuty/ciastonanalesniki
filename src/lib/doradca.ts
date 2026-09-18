export interface Pytanie {
  tresc: string;
  opcje: string[];
  poprawnaOdpowiedz: number;
}

export interface Lamiglowka {
  tresc: string;
  odpowiedz: string;
}

export interface Zawod {
  id: string;
  nazwa: string;
  kategoria: "powazny" | "zartobliwy";
  ikonaEmoji: string;
  mechanika: "quiz_wymagan" | "timer_reakcja" | "lamiglowka" | "zadanie_obliczeniowe" | "animacja_bez_pytan";
  wymagania?: string[];
  pytania?: Pytanie[];
  scenariuszTimer?: {
    tresc: string;
    limitSekund: number;
    opcje: string[];
    animacjaPorazki: string;
  };
  lamiglowki?: Lamiglowka[];
  zadanieObliczeniowe?: {
    szablonTresci: string;
    zakresyLosowania: Record<string, [number, number]>;
    wzorNaWynik: string; // Wyrażenie matematyczne jako string, używające kluczy z zakresyLosowania
  };
}

export const ZAWODY: Zawod[] = [
  // ZAWODY POWAŻNE
  {
    id: "przedsiebiorca_1",
    nazwa: "Przedsiębiorca 1",
    kategoria: "powazny",
    ikonaEmoji: "💼",
    mechanika: "quiz_wymagan",
    wymagania: ["Zarządzanie czasem", "Podstawy księgowości", "Odporność na stres"],
    pytania: [
      {
        tresc: "Podstawowy dokument finansowy podsumowujący działalność to:",
        opcje: ["Rachunek zysków i strat", "Paragon", "CV", "Menu"],
        poprawnaOdpowiedz: 0
      }
    ]
  },
  {
    id: "przedsiebiorca_2",
    nazwa: "Przedsiębiorca 2",
    kategoria: "powazny",
    ikonaEmoji: "📈",
    mechanika: "quiz_wymagan",
    wymagania: ["Budowanie zespołu", "Skalowanie biznesu", "Zarządzanie kapitałem"],
    pytania: [
      {
        tresc: "Skrót B2B oznacza biznes skierowany do:",
        opcje: ["Klienta detalicznego", "Innego biznesu (Business to Business)", "Dzieci", "Rządu"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "przedsiebiorca_3",
    nazwa: "Przedsiębiorca 3",
    kategoria: "powazny",
    ikonaEmoji: "📊",
    mechanika: "quiz_wymagan",
    wymagania: ["Inwestycje rynkowe", "Optymalizacja podatkowa", "Rozwój międzynarodowy"],
    pytania: [
      {
        tresc: "Główny indeks giełdowy w Polsce to:",
        opcje: ["NASDAQ", "WIG20", "DAX", "S&P 500"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "przedsiebiorca_4",
    nazwa: "Przedsiębiorca 4",
    kategoria: "powazny",
    ikonaEmoji: "🚀",
    mechanika: "quiz_wymagan",
    wymagania: ["Przywództwo", "Strategia globalna", "Fuzje i przejęcia"],
    pytania: [
      {
        tresc: "Stan, w którym firma kontroluje lwią część rynku nazywamy:",
        opcje: ["Oligopolem", "Monopolem", "Konkurencją doskonałą", "Spółdzielnią"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "architekt",
    nazwa: "Architekt",
    kategoria: "powazny",
    ikonaEmoji: "🏛️",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Rysunek odręczny i CAD",
      "Matematyka (geometria, trygonometria)",
      "Fizyka (statyka, wytrzymałość materiałów)",
      "Chemia i materiałoznawstwo",
      "Wyobraźnia przestrzenna"
    ],
    pytania: [
      {
        tresc: "Ile wynosi suma kątów wewnętrznych w dowolnym czworokącie wypukłym?",
        opcje: ["180°", "270°", "360°", "400°"],
        poprawnaOdpowiedz: 2
      },
      {
        tresc: "Który materiał budowlany ma najwyższą wytrzymałość na rozciąganie?",
        opcje: ["beton", "stal", "drewno", "cegła"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "W rzucie izometrycznym krawędzie bryły są standardowo nachylone o:",
        opcje: ["30°", "45°", "60°", "90°"],
        poprawnaOdpowiedz: 0
      }
    ]
  },
  {
    id: "kucharz",
    nazwa: "Kucharz",
    kategoria: "powazny",
    ikonaEmoji: "👨‍🍳",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Techniki obróbki termicznej",
      "Higiena i bezpieczeństwo żywności",
      "Komponowanie smaków",
      "Praca pod presją czasu",
      "Podstawy chemii (reakcja Maillarda, emulsje)"
    ],
    pytania: [
      {
        tresc: "Jaka jest minimalna bezpieczna temperatura wewnętrzna upieczonego drobiu?",
        opcje: ["50°C", "63°C", "74°C", "100°C"],
        poprawnaOdpowiedz: 2
      },
      {
        tresc: "Reakcja Maillarda odpowiada za:",
        opcje: ["psucie się mięsa", "brązowienie i smak przy smażeniu", "zamarzanie wody", "kiełkowanie warzyw"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Emulsja to połączenie:",
        opcje: ["dwóch cieczy, które się nie mieszają (np. olej i woda)", "dwóch gazów", "ciała stałego z gazem", "dwóch identycznych cieczy"],
        poprawnaOdpowiedz: 0
      }
    ]
  },
  {
    id: "pilkarz",
    nazwa: "Piłkarz",
    kategoria: "powazny",
    ikonaEmoji: "⚽",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Kondycja i wytrzymałość",
      "Koordynacja ruchowa",
      "Taktyka gry zespołowej",
      "Szybkość reakcji",
      "Dyscyplina treningowa"
    ],
    pytania: [
      {
        tresc: "Ilu zawodników jednej drużyny jest na boisku podczas meczu (bez rezerwowych)?",
        opcje: ["9", "10", "11", "12"],
        poprawnaOdpowiedz: 2
      },
      {
        tresc: "Jak nazywa się przewinienie za dotknięcie piłki ręką przez zawodnika z pola?",
        opcje: ["spalony", "faul", "ręka", "aut"],
        poprawnaOdpowiedz: 2
      },
      {
        tresc: "Spalony dotyczy zawodnika, który w momencie podania:",
        opcje: ["jest bliżej linii bramkowej przeciwnika niż piłka i przedostatni obrońca", "trzyma piłkę dłużej niż 5 sekund", "stoi poza boiskiem", "nie ma stroju drużyny"],
        poprawnaOdpowiedz: 0
      }
    ]
  },
  {
    id: "hydraulik",
    nazwa: "Hydraulik",
    kategoria: "powazny",
    ikonaEmoji: "🔧",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Instalacje wodno-kanalizacyjne",
      "Podstawy fizyki (ciśnienie, przepływ cieczy)",
      "Czytanie schematów technicznych",
      "Zdolności manualne",
      "Znajomość materiałów"
    ],
    pytania: [
      {
        tresc: "Zgodnie z prawem Pascala, ciśnienie wywierane na ciecz w zamkniętym zbiorniku:",
        opcje: ["rozchodzi się jednakowo we wszystkich kierunkach", "działa tylko w dół", "znika po chwili", "zależy od koloru cieczy"],
        poprawnaOdpowiedz: 0
      },
      {
        tresc: "Do połączeń rur odpornych na korozję najczęściej używa się:",
        opcje: ["żelaza", "miedzi lub PVC", "drewna", "folii aluminiowej"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Syfon pod zlewem ma za zadanie głównie:",
        opcje: ["przyspieszać spływ wody", "blokować nieprzyjemne zapachy z kanalizacji (wodą)", "filtrować wodę", "podgrzewać wodę"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "spawacz",
    nazwa: "Spawacz",
    kategoria: "powazny",
    ikonaEmoji: "🔥",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Metale i ich właściwości",
      "Obsługa spawarki (MIG/MAG/TIG)",
      "Zasady BHP",
      "Precyzja manualna",
      "Czytanie rysunku technicznego"
    ],
    pytania: [
      {
        tresc: "Która metoda spawania wykorzystuje nietopliwą elektrodę wolframową i jest ceniona za dokładność?",
        opcje: ["MIG", "MAG", "TIG", "zgrzewanie"],
        poprawnaOdpowiedz: 2
      },
      {
        tresc: "Podczas spawania oczy i skórę chroni się głównie przed:",
        opcje: ["hałasem", "promieniowaniem UV i iskrami", "zapachem", "niską temperaturą"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Temperatura topnienia stali wynosi w przybliżeniu:",
        opcje: ["ok. 100°C", "ok. 500°C", "ok. 1500°C", "ok. 5000°C"],
        poprawnaOdpowiedz: 2
      }
    ]
  },
  {
    id: "mechanik",
    nazwa: "Mechanik samochodowy",
    kategoria: "powazny",
    ikonaEmoji: "🚗",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Budowa silnika",
      "Podstawy elektryki samochodowej",
      "Diagnostyka usterek",
      "Zdolności manualne",
      "Czytanie kodów błędów OBD"
    ],
    pytania: [
      {
        tresc: "Co odpowiada za zapłon mieszanki paliwowo-powietrznej w silniku benzynowym?",
        opcje: ["świeca żarowa", "świeca zapłonowa", "wtryskiwacz", "alternator"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Rola alternatora w samochodzie to:",
        opcje: ["chłodzenie silnika", "ładowanie akumulatora i zasilanie instalacji podczas jazdy", "napędzanie kół", "filtrowanie oleju"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Silnik Diesla różni się od benzynowego głównie tym, że:",
        opcje: ["nie ma cylindrów", "zapłon mieszanki następuje od sprężenia, bez świecy zapłonowej", "nie potrzebuje paliwa", "działa tylko na prąd"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "lekarz",
    nazwa: "Lekarz",
    kategoria: "powazny",
    ikonaEmoji: "🩺",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Anatomia i fizjologia",
      "Biologia i chemia",
      "Decyzje pod presją",
      "Empatia i komunikacja z pacjentem",
      "Wieloletnia edukacja i praktyka kliniczna"
    ],
    pytania: [
      {
        tresc: "Ile komór ma prawidłowo zbudowane ludzkie serce?",
        opcje: ["2", "3", "4", "5"],
        poprawnaOdpowiedz: 2
      },
      {
        tresc: "Który układ odpowiada za transport tlenu do komórek ciała?",
        opcje: ["pokarmowy", "krwionośny", "nerwowy", "kostny"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Podwyższona temperatura ciała (gorączka) jest najczęściej reakcją na:",
        opcje: ["infekcję", "głód", "sen", "ćwiczenia fizyczne"],
        poprawnaOdpowiedz: 0
      }
    ]
  },
  {
    id: "prawnik",
    nazwa: "Prawnik",
    kategoria: "powazny",
    ikonaEmoji: "⚖️",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Znajomość prawa i przepisów",
      "Analiza tekstu i argumentacja",
      "Retoryka i wystąpienia publiczne",
      "Etyka zawodowa",
      "Wieloletnie studia i aplikacja"
    ],
    pytania: [
      {
        tresc: "Jak nazywa się akt prawny najwyższej rangi w polskim systemie prawnym?",
        opcje: ["ustawa", "rozporządzenie", "Konstytucja", "regulamin"],
        poprawnaOdpowiedz: 2
      },
      {
        tresc: "Strona wnosząca sprawę do sądu cywilnego nazywana jest:",
        opcje: ["pozwanym", "powodem", "świadkiem", "biegłym"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Domniemanie niewinności oznacza, że:",
        opcje: ["oskarżony musi udowodnić swoją niewinność", "oskarżonego uznaje się za niewinnego, dopóki wina nie zostanie udowodniona", "sąd zawsze uniewinnia", "nie potrzeba dowodów w procesie"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "fizyk",
    nazwa: "Fizyk",
    kategoria: "powazny",
    ikonaEmoji: "🔬",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Zaawansowana matematyka",
      "Prawa fizyki",
      "Projektowanie eksperymentów",
      "Cierpliwość w analizie danych",
      "Ciekawość poznawcza"
    ],
    pytania: [
      {
        tresc: "Jaka jest jednostka siły w układzie SI?",
        opcje: ["dżul", "niuton", "wat", "paskal"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Zgodnie z II zasadą dynamiki Newtona, przyspieszenie ciała jest:",
        opcje: ["odwrotnie proporcjonalne do siły", "wprost proporcjonalne do siły i odwrotnie proporcjonalne do masy", "stałe niezależnie od siły", "zależne tylko od masy"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Prędkość światła w próżni wynosi w przybliżeniu:",
        opcje: ["300 km/s", "300 000 km/s", "3000 km/s", "30 000 km/s"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "szalony_naukowiec",
    nazwa: "Szalony Naukowiec",
    kategoria: "zartobliwy", // Choć trochę edukacyjny, ton jest żartobliwy
    ikonaEmoji: "🧪",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Skłonność do eksperymentowania",
      "Chemia i fizyka",
      "Improwizacja",
      "Przestrzeganie BHP w laboratorium"
    ],
    pytania: [
      {
        tresc: "Mieszanie octu z sodą oczyszczoną wydziela głównie:",
        opcje: ["tlen", "dwutlenek węgla", "wodór", "azot"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Symbol 'Na' w układzie okresowym oznacza:",
        opcje: ["neon", "azot", "sód", "nikiel"],
        poprawnaOdpowiedz: 2
      },
      {
        tresc: "Zanim 'szalony naukowiec' cokolwiek podpali w laboratorium, powinien najpierw:",
        opcje: ["zdjąć okulary ochronne", "sprawdzić, gdzie jest gaśnica, i wywietrzyć pomieszczenie", "zjeść drugie śniadanie", "zapytać kolegę o zdanie"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "informatyk",
    nazwa: "Informatyk",
    kategoria: "powazny",
    ikonaEmoji: "💻",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Logiczne myślenie",
      "Znajomość algorytmów",
      "Języki programowania",
      "Cierpliwość przy debugowaniu",
      "Język angielski techniczny"
    ],
    pytania: [
      {
        tresc: "Jak nazywa się podstawowy system liczbowy używany w elektronice i informatyce (0 i 1)?",
        opcje: ["Dziesiętny", "Szesnastkowy", "Dwójkowy (binarny)", "Ósemkowy"],
        poprawnaOdpowiedz: 2
      },
      {
        tresc: "Który z poniższych NIE jest językiem programowania?",
        opcje: ["Python", "HTML", "C++", "Java"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Co oznacza skrót RAM?",
        opcje: ["Random Access Memory", "Read Access Memory", "Run Action Module", "Realtime Application Memory"],
        poprawnaOdpowiedz: 0
      }
    ]
  },
  {
    id: "trener_akrobatyki",
    nazwa: "Trener Akrobatyki",
    kategoria: "powazny",
    ikonaEmoji: "🤸",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Wybitna sprawność fizyczna",
      "Wiedza o biomechanice",
      "Cierpliwość do podopiecznych",
      "Umiejętność asekuracji",
      "Zasady pierwszej pomocy"
    ],
    pytania: [
      {
        tresc: "Podstawowy skok w akrobatyce, gdzie ciało wykonuje pełny obrót w powietrzu to:",
        opcje: ["Szpagat", "Salto", "Mostek", "Piruet"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Co jest najważniejsze podczas asekuracji początkującego akrobaty?",
        opcje: ["Krzyczenie dla zachęty", "Zabezpieczenie głowy i karku", "Nagrywanie filmu na TikToka", "Liczenie powtórzeń"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Zdolność do wykonywania ruchów w pełnym zakresie stawów to:",
        opcje: ["Siła", "Szybkość", "Gibkość", "Wytrzymałość"],
        poprawnaOdpowiedz: 2
      }
    ]
  },
  {
    id: "czysciciel_okien",
    nazwa: "Wysokościowy Czyściciel Okien",
    kategoria: "powazny",
    ikonaEmoji: "🏢",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Brak lęku wysokości",
      "Techniki alpinistyczne",
      "Sprawność fizyczna",
      "Znajomość sprzętu asekuracyjnego",
      "Ostrożność i dokładność"
    ],
    pytania: [
      {
        tresc: "Podstawowy element zabezpieczający pracownika wysokościowego przed upadkiem to:",
        opcje: ["Kask", "Uprząż i lina asekuracyjna", "Rękawice", "Mocne buty"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Ile niezależnych punktów wpięcia (lin) musi mieć pracownik wykonujący prace na wysokości w dostępie linowym?",
        opcje: ["Co najmniej jeden", "Co najmniej dwa", "Co najmniej cztery", "Nie musi mieć żadnego"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Jakie zjawisko pogodowe jest najbardziej niebezpieczne dla czyściciela okien na wieżowcu?",
        opcje: ["Silny wiatr", "Delikatna mżawka", "Ostre słońce", "Przelotne zachmurzenie"],
        poprawnaOdpowiedz: 0
      }
    ]
  },
  {
    id: "kierowca_tramwaju",
    nazwa: "Kierowca Tramwaju",
    kategoria: "powazny",
    ikonaEmoji: "🚋",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Pozwolenie na tramwaj",
      "Znajomość przepisów ruchu drogowego",
      "Odporność na stres",
      "Szybki czas reakcji",
      "Dobra koncentracja"
    ],
    pytania: [
      {
        tresc: "Tramwaj skręcający na skrzyżowaniu (bez sygnalizacji kierunkowej) względem samochodu jadącego prosto z przeciwka:",
        opcje: ["Ma zawsze pierwszeństwo", "Ustępuje pierwszeństwa", "Zasada prawej ręki decyduje", "Kto pierwszy ten lepszy"],
        poprawnaOdpowiedz: 0
      },
      {
        tresc: "Co to jest pantograf?",
        opcje: ["Rodzaj hamulca", "Urządzenie na dachu odbierające prąd z sieci trakcyjnej", "Przednia szyba tramwaju", "Przycisk otwierający drzwi"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Jaki jest główny problem przy hamowaniu tramwajem w porównaniu do auta?",
        opcje: ["Brak pedału hamulca", "Droga hamowania stalowych kół na szynach jest znacznie dłuższa", "Tramwaj nie ma hamulców", "Hamowanie zużywa dużo prądu"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "maszynista",
    nazwa: "Kierowca Pociągu",
    kategoria: "powazny",
    ikonaEmoji: "🚆",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Licencja maszynisty",
      "Znajomość instrukcji kolejowych",
      "Znakomity wzrok i słuch",
      "Umiejętność pracy zmianowej",
      "Ogromna odpowiedzialność"
    ],
    pytania: [
      {
        tresc: "Co na kolei oznacza pojęcie 'czuwak'?",
        opcje: ["Asystent maszynisty", "Urządzenie sprawdzające czujność maszynisty", "Rodzaj semafora", "Pies pilnujący stacji"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Czy pociąg towarowy ma dłuższą drogę hamowania niż osobowy (przy tej samej prędkości)?",
        opcje: ["Nie, krótszą", "Droga hamowania jest taka sama", "Tak, ze względu na znacznie większą masę", "Pociąg towarowy w ogóle nie hamuje"],
        poprawnaOdpowiedz: 2
      },
      {
        tresc: "Sygnał czerwony na semaforze oznacza:",
        opcje: ["Zwolnij do 20 km/h", "Stój", "Droga wolna", "Awaria zasilania"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "kierowca_autobusu",
    nazwa: "Kierowca autobusu",
    kategoria: "powazny",
    ikonaEmoji: "🚌",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Prawo jazdy kat. D i kwalifikacje",
      "Cierpliwość do pasażerów",
      "Płynna jazda",
      "Znajomość topografii miasta",
      "Odporność na stres w korkach"
    ],
    pytania: [
      {
        tresc: "Autobus wyjeżdżający z zatoki przystankowej w terenie zabudowanym:",
        opcje: ["Musi poczekać aż wszystkie auta przejadą", "Ma bezwzględne pierwszeństwo", "Inni kierowcy mają obowiązek ułatwić mu włączenie się do ruchu", "Może wyjechać tylko na zielonym świetle"],
        poprawnaOdpowiedz: 2
      },
      {
        tresc: "Dlaczego kierowca autobusu musi otwierać szerzej zakręty?",
        opcje: ["Żeby wolniej jechać", "Ze względu na duży rozstaw osi – tylne koła ścinają zakręt", "Bo autobus ma za małą kierownicę", "To tylko mit"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Co powinien zrobić kierowca widząc wbiegającego na przejście pieszego?",
        opcje: ["Zatrzymać się i ustąpić pierwszeństwa", "Zatrąbić i jechać dalej", "Przyspieszyć", "Mignąć światłami"],
        poprawnaOdpowiedz: 0
      }
    ]
  },
  {
    id: "ratownik_medyczny",
    nazwa: "Ratownik Medyczny",
    kategoria: "powazny",
    ikonaEmoji: "🚑",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Wiedza medyczna i ratownicza",
      "Zdolność działania w stresie",
      "Sprawność fizyczna",
      "Szybkie podejmowanie decyzji",
      "Odporność psychiczna"
    ],
    pytania: [
      {
        tresc: "Prawidłowe tempo uciśnięć klatki piersiowej podczas RKO u dorosłego wynosi około:",
        opcje: ["60 na minutę", "100-120 na minutę", "160 na minutę", "Tyle ile fabryka dała"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Stosunek uciśnięć do wdechów ratowniczych u dorosłego to:",
        opcje: ["15:2", "30:2", "5:1", "10:2"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Co to jest AED?",
        opcje: ["Automatyczny Elektryczny Dystrybutor", "Automatyczny Zewnętrzny Defibrylator", "Aparat Endoskopowy Dochodzeniowy", "Ambulans Ewakuacji Drogowej"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "ortopeda",
    nazwa: "Ortopeda",
    kategoria: "powazny",
    ikonaEmoji: "🦴",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Wiedza anatomiczna (układ ruchu)",
      "Umiejętności chirurgiczne",
      "Zdolności manualne",
      "Interpretacja badań obrazowych (RTG, MRI)",
      "Empatia do pacjenta"
    ],
    pytania: [
      {
        tresc: "Jak nazywa się największa i najdłuższa kość w organizmie człowieka?",
        opcje: ["Kość ramienna", "Kość udowa", "Kość piszczelowa", "Miednica"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Gips ortopedyczny najczęściej stosuje się przy:",
        opcje: ["Skaleczeniach skóry", "Złamaniach kości", "Przeziębieniach", "Wypadaniu włosów"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Co łączy kości w stawie, zapobiegając ich przemieszczeniom?",
        opcje: ["Ścięgna", "Więzadła", "Mięśnie", "Chrząstki"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "lekarz_rodzinny",
    nazwa: "Lekarz rodzinny",
    kategoria: "powazny",
    ikonaEmoji: "🏥",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Szeroka wiedza ogólnomedyczna",
      "Umiejętność wywiadu lekarskiego",
      "Holistyczne podejście do pacjenta",
      "Wiedza o szczepieniach i profilaktyce",
      "Cierpliwość i empatia"
    ],
    pytania: [
      {
        tresc: "Prawidłowe ciśnienie tętnicze krwi u dorosłego człowieka oscyluje w granicach:",
        opcje: ["80/50 mmHg", "120/80 mmHg", "160/100 mmHg", "200/120 mmHg"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Co to jest antybiotyk?",
        opcje: ["Lek niszczący wirusy", "Lek niszczący bakterie", "Lek przeciwbólowy", "Witamina"],
        poprawnaOdpowiedz: 1
      },
      {
        tresc: "Profilaktyka pierwotna w medycynie rodzinnej polega na:",
        opcje: ["Leczeniu zaawansowanych nowotworów", "Operacjach chirurgicznych", "Zapobieganiu chorobom (np. szczepienia, dieta)", "Wypisywaniu zwolnień lekarskich"],
        poprawnaOdpowiedz: 2
      }
    ]
  },
  {
    id: "kierowca_karetki",
    nazwa: "Kierowca Karetki",
    kategoria: "powazny",
    ikonaEmoji: "🚑",
    mechanika: "quiz_wymagan",
    wymagania: [
      "Doskonałe umiejętności prowadzenia pojazdu",
      "Uprawnienia na pojazdy uprzywilejowane",
      "Opanowanie pod presją czasu",
      "Topografia terenu działania",
      "Podstawy pierwszej pomocy"
    ],
    pytania: [
      {
        tresc: "Kiedy karetka staje się pojazdem uprzywilejowanym w ruchu drogowym?",
        opcje: ["Zawsze, kiedy jest na służbie", "Gdy ma włączone światła mijania", "Gdy wysyła jednocześnie sygnały świetlne i dźwiękowe", "Tylko w nocy"],
        poprawnaOdpowiedz: 2
      },
      {
        tresc: "Czy pojazd uprzywilejowany może nie stosować się do przepisów ruchu (np. na czerwonym świetle)?",
        opcje: ["Tak, pod warunkiem zachowania szczególnej ostrożności", "Nie, nigdy", "Tak, ale tylko na autostradzie", "Tak, i inni odpowiadają za ewentualny wypadek"],
        poprawnaOdpowiedz: 0
      },
      {
        tresc: "Jeśli słyszysz sygnał karetki, powinieneś:",
        opcje: ["Zatrzymać się natychmiast na środku pasa", "Przyspieszyć by uciec", "Ułatwić przejazd (zjechać do krawędzi tzw. korytarzem życia)", "Zignorować, bo jedziesz swoim pasem"],
        poprawnaOdpowiedz: 2
      }
    ]
  },
  {
    id: "straznik_miejski",
    nazwa: "Strażnik Miejski",
    kategoria: "powazny",
    ikonaEmoji: "🎫",
    mechanika: "quiz_wymagan",
    wymagania: ["Znajomość prawa miejscowego", "Sprawność fizyczna", "Cierpliwość"],
    pytania: [
      {
        tresc: "Strażnik miejski może wystawić mandat m.in. za:",
        opcje: ["Złe parkowanie", "Zabójstwo", "Przekroczenie prędkości na autostradzie", "Złą ocenę z matematyki"],
        poprawnaOdpowiedz: 0
      }
    ]
  },
  {
    id: "policjant",
    nazwa: "Pan Policjant",
    kategoria: "powazny",
    ikonaEmoji: "🚓",
    mechanika: "quiz_wymagan",
    wymagania: ["Sprawność fizyczna i testy psychologiczne", "Znajomość kodeksów", "Obsługa broni"],
    pytania: [
      {
        tresc: "Numer alarmowy na policję (choć dzisiaj działa głównie 112) to:",
        opcje: ["999", "998", "997", "911"],
        poprawnaOdpowiedz: 2
      }
    ]
  },
  {
    id: "sedzia",
    nazwa: "Sędzia",
    kategoria: "powazny",
    ikonaEmoji: "⚖️",
    mechanika: "quiz_wymagan",
    wymagania: ["Nieskazitelny charakter", "Aplikacja sędziowska", "Bezwzględna znajomość prawa"],
    pytania: [
      {
        tresc: "Sędzia na sali sądowej nosi togę z żabotem w kolorze:",
        opcje: ["Czerwonym", "Fioletowym", "Zielonym", "Niebieskim"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "prokurator",
    nazwa: "Prokurator",
    kategoria: "powazny",
    ikonaEmoji: "📜",
    mechanika: "quiz_wymagan",
    wymagania: ["Aplikacja prokuratorska", "Odporność na stres", "Zdolności analityczne"],
    pytania: [
      {
        tresc: "Głównym zadaniem prokuratora jest:",
        opcje: ["Obrona oskarżonego", "Stanie na straży praworządności i oskarżanie w sądzie", "Wydawanie wyroków", "Pisanie ustaw"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "adwokat",
    nazwa: "Adwokat",
    kategoria: "powazny",
    ikonaEmoji: "🏛️",
    mechanika: "quiz_wymagan",
    wymagania: ["Aplikacja adwokacka", "Elokwencja", "Umiejętność interpretacji przepisów"],
    pytania: [
      {
        tresc: "Adwokata obowiązuje bezwzględnie:",
        opcje: ["Tajemnica spowiedzi", "Tajemnica adwokacka", "Tajemnica państwowa", "Milczenie na sali"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "zolnierz",
    nazwa: "Żołnierz",
    kategoria: "powazny",
    ikonaEmoji: "🪖",
    mechanika: "quiz_wymagan",
    wymagania: ["Doskonała kondycja", "Dyscyplina", "Znajomość taktyki i broni"],
    pytania: [
      {
        tresc: "Jaki jest podstawowy karabin szturmowy w polskim wojsku nowej generacji?",
        opcje: ["AK-47", "M16", "MSBS Grot", "P90"],
        poprawnaOdpowiedz: 2
      }
    ]
  },
  
  // ZAWODY ŻARTOBLIWE - INNE MECHANIKI
  {
    id: "gangster",
    nazwa: "Gangster",
    kategoria: "zartobliwy",
    ikonaEmoji: "🚔",
    mechanika: "timer_reakcja",
    scenariuszTimer: {
      tresc: "Goni cię policja! Co robisz?",
      limitSekund: 3,
      opcje: [
        "Uciekaj przez podwórka",
        "Zadzwoń po prawnika",
        "Poddaj się",
        "Ukryj się w kontenerze"
      ],
      animacjaPorazki: "Złapali cię! Wybierz inną drogę!"
    }
  },
  {
    id: "haker",
    nazwa: "Haker",
    kategoria: "zartobliwy",
    ikonaEmoji: "💻",
    mechanika: "lamiglowka",
    lamiglowki: [
      {
        tresc: "Złam nasz kod! (Szyfr Cezara, przesunięcie o 3 litery wstecz, jak z C do Z? Nie, A->D, więc D->A. Szyfr przesunięty o 3 litery, odszyfruj: PDWHPDWBND)",
        odpowiedz: "MATEMATYKA"
      },
      {
        tresc: "Jestem trzycyfrową liczbą podzielną przez 100. Suma moich cyfr wynosi 6. Jaka to liczba?",
        odpowiedz: "600"
      }
    ]
  },
  {
    id: "szambonurek",
    nazwa: "Szambonurek",
    kategoria: "zartobliwy",
    ikonaEmoji: "🤿",
    mechanika: "zadanie_obliczeniowe",
    zadanieObliczeniowe: {
      szablonTresci: "Masz butlę z {pojemnosc} litrami tlenu. Podczas nurkowania zużywasz {zuzycie_ml} ml tlenu na każdy oddech i robisz {oddechy_na_min} oddechów na minutę. Na ile minut wystarczy Ci tlenu? (Podaj wynik z dokładnością np. 3.33)",
      zakresyLosowania: {
        "pojemnosc": [20, 40],
        "zuzycie_ml": [150, 300],
        "oddechy_na_min": [30, 50]
      },
      wzorNaWynik: "pojemnosc / (zuzycie_ml * oddechy_na_min / 1000)"
    }
  },
  {
    id: "kopanie_rowow",
    nazwa: "Kopanie rowów",
    kategoria: "zartobliwy",
    ikonaEmoji: "⛏️",
    mechanika: "animacja_bez_pytan"
  },
  {
    id: "bmxiarz",
    nazwa: "BMX-iarz",
    kategoria: "zartobliwy",
    ikonaEmoji: "🚲",
    mechanika: "timer_reakcja",
    scenariuszTimer: {
      tresc: "Zjeżdżasz ze schodów na BMX-ie! Zbliża się murek, zrób bunny hopa!",
      limitSekund: 2,
      opcje: ["Hamuj!", "Podskocz!", "Zsiądź z roweru", "Zamknij oczy"],
      animacjaPorazki: "Opona przebita, gleba na betonie!"
    }
  },
  {
    id: "skater",
    nazwa: "Skater",
    kategoria: "zartobliwy",
    ikonaEmoji: "🛹",
    mechanika: "lamiglowka",
    lamiglowki: [
      {
        tresc: "Rozwiązujesz deskorolkową zagadkę: Zrobiłeś kickflipa, potem 360 flipa, a na koniec jeszcze heelflipa. Ile obrotów deski wokół osi podłużnej (flipów) zrobiłeś łącznie? (podaj liczbę)",
        odpowiedz: "3"
      }
    ]
  },
  {
    id: "scooter_kid",
    nazwa: "SKUTERKID (hulajnogarz)",
    kategoria: "zartobliwy",
    ikonaEmoji: "🛴",
    mechanika: "lamiglowka",
    lamiglowki: [
      {
        tresc: "Wjechałeś na bowl. Wkurzasz 8 skaterów, wjeżdżasz pod koła 5 BMX-iarzom i zajeżdżasz drogę 2 rolkarzom. Z jaką prędkością musisz uciekać na hulajnodze (w km/h), jeśli Twoja prędkość bazowa wynosi 7 km/h, a każdy goniący dodaje 4 km/h do wymaganego tempa?",
        odpowiedz: "67"
      }
    ]
  },
  {
    id: "elektryk_ziomal",
    nazwa: "Elektryk",
    kategoria: "zartobliwy",
    ikonaEmoji: "⚡",
    mechanika: "quiz_wymagan",
    wymagania: ["Uprawnienia SEP", "Odporność na wstrząsy"],
    pytania: [
      {
        tresc: "Co robisz, gdy kabel jest pod napięciem?",
        opcje: ["Przecinasz go nożyczkami", "Łapiesz za izolację", "Dotykasz językiem", "Dzwonisz do mamy"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "hydraulik_ziomal",
    nazwa: "Hydraulik",
    kategoria: "zartobliwy",
    ikonaEmoji: "🚽",
    mechanika: "quiz_wymagan",
    wymagania: ["Klucz francuski", "Brak węchu"],
    pytania: [
      {
        tresc: "Gdy woda leje się z sufitu, w pierwszej kolejności:",
        opcje: ["Zakręcasz główny zawór", "Podstawiasz wiadro", "Robisz zdjęcie na Insta", "Bierzesz szampon"],
        poprawnaOdpowiedz: 0
      }
    ]
  },
  {
    id: "kulturysta",
    nazwa: "Kulturysta",
    kategoria: "zartobliwy",
    ikonaEmoji: "💪",
    mechanika: "quiz_wymagan",
    wymagania: ["Kurczak i ryż", "Brak karku", "Karnet na siłkę"],
    pytania: [
      {
        tresc: "Najważniejszy posiłek dnia kulturysty to:",
        opcje: ["Płatki z mlekiem", "Białko po treningu (okno anaboliczne!)", "Czekolada", "Woda z cytryną"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "bezrobotny",
    nazwa: "Bezrobotny",
    kategoria: "zartobliwy",
    ikonaEmoji: "🛋️",
    mechanika: "quiz_wymagan",
    wymagania: ["Wygodna kanapa", "Netflix", "Umiejętność omijania Urzędu Pracy"],
    pytania: [
      {
        tresc: "Jaki dzień tygodnia najbardziej stresuje bezrobotnego?",
        opcje: ["Poniedziałek", "Piątek", "Niedziela wieczór", "Każdy jest taki sam"],
        poprawnaOdpowiedz: 3
      }
    ]
  },
  {
    id: "cold_caller",
    nazwa: "Cold Caller",
    kategoria: "zartobliwy",
    ikonaEmoji: "📞",
    mechanika: "quiz_wymagan",
    wymagania: ["Twarda psychika", "Zatyczki do uszu", "Fotowoltaika w żyłach"],
    pytania: [
      {
        tresc: "Jak zaczynasz rozmowę po usłyszeniu 'halo'?",
        opcje: ["Dzień dobry, czy pan XYZ?", "Mam dla Pana darmowy pokaz garnków", "Czy jest Pan właścicielem dachu?", "Wszystkie powyższe"],
        poprawnaOdpowiedz: 3
      }
    ]
  },
  {
    id: "pilot_samochodu",
    nazwa: "Pilot samochodu",
    kategoria: "zartobliwy",
    ikonaEmoji: "🗺️",
    mechanika: "timer_reakcja",
    scenariuszTimer: {
      tresc: "Kierowca zasuwa 150 km/h w lesie. Co mu dyktujesz?",
      limitSekund: 3,
      opcje: ["Prawy 3, nie tnij!", "Prosto w drzewo!", "Zwolnij, bo się boję", "Otwórz okno"],
      animacjaPorazki: "Nie zdążyłeś! Dachowanie!"
    }
  },
  {
    id: "mechanik_ziomal",
    nazwa: "Mechanik Samochodowy",
    kategoria: "zartobliwy",
    ikonaEmoji: "🔧",
    mechanika: "quiz_wymagan",
    wymagania: ["Szara taśma", "Trytytki", "Diagnoza 'panie, kto to panu tak sp...?'"],
    pytania: [
      {
        tresc: "Gdy świeci się Check Engine, profesjonalny ziomal mechanik:",
        opcje: ["Kasuje błąd i mówi że naprawione", "Okleja kontrolkę czarną taśmą", "Mówię 'ten typ tak ma'", "Wszystkie z wymienionych"],
        poprawnaOdpowiedz: 3
      }
    ]
  },
  {
    id: "mechanik_samolotowy",
    nazwa: "Mechanik Samolotowy",
    kategoria: "zartobliwy",
    ikonaEmoji: "✈️",
    mechanika: "quiz_wymagan",
    wymagania: ["Duuużo trytytek", "Brak lęku wysokości", "Więcej taśmy klejącej"],
    pytania: [
      {
        tresc: "Gdy skrzydło odpada, co robisz?",
        opcje: ["Wołam kapitana", "Sklejam na taśmę Speed Tape", "Mówię, że to wina pilota", "Udaję, że nie widzę"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "informatyk_ziomal",
    nazwa: "Informatyk",
    kategoria: "zartobliwy",
    ikonaEmoji: "🧑‍💻",
    mechanika: "quiz_wymagan",
    wymagania: ["Umiejętność googlowania", "Kawa we krwi", "Restartowanie wszystkiego"],
    pytania: [
      {
        tresc: "Jaka jest uniwersalna rada na każdy problem z komputerem?",
        opcje: ["Sformatuj dysk", "A próbował pan wyłączyć i włączyć?", "Zadzwoń do Microsoftu", "Kup Maca"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "komandos",
    nazwa: "Komandos",
    kategoria: "zartobliwy",
    ikonaEmoji: "🥷",
    mechanika: "quiz_wymagan",
    wymagania: ["Przewroty w tył", "Kamuflaż z błota", "Jedzenie robaków"],
    pytania: [
      {
        tresc: "Co jest najważniejsze w byciu komandosem?",
        opcje: ["Dobra strzelba", "Wyglądanie fajnie w okularach przeciwsłonecznych", "Ciche skradanie", "Zrobienie pompki na jednym palcu"],
        poprawnaOdpowiedz: 1
      }
    ]
  },
  {
    id: "skoczek_spadochronowy",
    nazwa: "Skoczek Spadochronowy",
    kategoria: "zartobliwy",
    ikonaEmoji: "🪂",
    mechanika: "timer_reakcja",
    scenariuszTimer: {
      tresc: "Lecisz z 4000 metrów, główny spadochron się nie otwiera!",
      limitSekund: 2,
      opcje: ["Macham rękami jak ptak", "Otwieram zapasowy!", "Dzwonię do mamy", "Zamykam oczy"],
      animacjaPorazki: "Splat!"
    }
  }
];
