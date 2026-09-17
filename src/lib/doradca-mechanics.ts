export function sprawdzLamiglowke(odpowiedzUzytkownika: string, poprawnaOdpowiedz: string): boolean {
  if (!odpowiedzUzytkownika || !poprawnaOdpowiedz) return false;
  
  const cleanUzytkownik = odpowiedzUzytkownika.trim().toLowerCase();
  const cleanPoprawna = poprawnaOdpowiedz.trim().toLowerCase();
  
  return cleanUzytkownik === cleanPoprawna;
}

export interface WylosowaneZadanieObliczeniowe {
  tresc: string;
  wylosowaneWartosci: Record<string, number>;
  poprawnyWynik: number;
}

export function losujZadanieObliczeniowe(
  szablon: string, 
  zakresy: Record<string, [number, number]>, 
  wzorNaWynik: string
): WylosowaneZadanieObliczeniowe {
  const wylosowaneWartosci: Record<string, number> = {};
  let przetworzonaTresc = szablon;
  
  // Losowanie wartości dla zmiennych
  Object.keys(zakresy).forEach(klucz => {
    const [min, max] = zakresy[klucz];
    // Losujemy całkowitoliczbową wartość z zakresu
    const wylosowana = Math.floor(Math.random() * (max - min + 1)) + min;
    wylosowaneWartosci[klucz] = wylosowana;
    
    // Zastępowanie w szablonie (np. {pojemnosc})
    przetworzonaTresc = przetworzonaTresc.replace(new RegExp(`{${klucz}}`, 'g'), wylosowana.toString());
  });
  
  // Obliczanie wyniku ze wzoru
  let przetworzonyWzor = wzorNaWynik;
  Object.keys(wylosowaneWartosci).forEach(klucz => {
    // Proste podstawienie wartości w miejsca zmiennych w ciągu znaków
    przetworzonyWzor = przetworzonyWzor.replace(new RegExp(`\\b${klucz}\\b`, 'g'), wylosowaneWartosci[klucz].toString());
  });
  
  // Bezpieczne użycie konstruktora Function zamiast eval()
  let poprawnyWynik = 0;
  try {
    const oblicz = new Function(`return ${przetworzonyWzor}`);
    poprawnyWynik = oblicz();
  } catch (err) {
    console.error("Błąd w ewaluacji wzoru:", wzorNaWynik, err);
  }
  
  return {
    tresc: przetworzonaTresc,
    wylosowaneWartosci,
    poprawnyWynik
  };
}

export function sprawdzZadanieObliczeniowe(wynikUzytkownika: number, poprawnyWynik: number, marginesBleduProcent = 5): boolean {
  const roznica = Math.abs(wynikUzytkownika - poprawnyWynik);
  const akceptowalnyBlad = Math.abs(poprawnyWynik * (marginesBleduProcent / 100));
  
  return roznica <= akceptowalnyBlad;
}
