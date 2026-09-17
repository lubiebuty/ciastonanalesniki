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
  }
];
