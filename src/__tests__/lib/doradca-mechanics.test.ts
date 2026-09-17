import { describe, it, expect } from 'vitest';
import { sprawdzLamiglowke, losujZadanieObliczeniowe, sprawdzZadanieObliczeniowe } from '@/lib/doradca-mechanics';

describe('Doradca Zawodowy - Mechaniki', () => {
  describe('sprawdzLamiglowke', () => {
    it('powinien ignorować wielkość liter', () => {
      expect(sprawdzLamiglowke('MATEMATYKA', 'matematyka')).toBe(true);
      expect(sprawdzLamiglowke('MaTeMaTyKa', 'MATEMATYKA')).toBe(true);
    });

    it('powinien ignorować białe znaki na początku i na końcu', () => {
      expect(sprawdzLamiglowke('  600 ', '600')).toBe(true);
    });

    it('powinien poprawnie odrzucać błędne odpowiedzi', () => {
      expect(sprawdzLamiglowke('matematyka', 'fizyka')).toBe(false);
      expect(sprawdzLamiglowke('500', '600')).toBe(false);
    });
  });

  describe('Zadanie obliczeniowe', () => {
    const szablon = 'Masz butlę z {pojemnosc} litrami tlenu. Zużywasz {zuzycie_ml} ml/oddech. Robisz {oddechy_na_min} oddechów/min.';
    const zakresy = {
      pojemnosc: [20, 40] as [number, number],
      zuzycie_ml: [150, 300] as [number, number],
      oddechy_na_min: [30, 50] as [number, number]
    };
    const wzor = 'pojemnosc / (zuzycie_ml * oddechy_na_min / 1000)';

    it('powinien generować treść z wylosowanymi wartościami', () => {
      const wynik = losujZadanieObliczeniowe(szablon, zakresy, wzor);
      
      expect(wynik.tresc).not.toContain('{pojemnosc}');
      expect(wynik.tresc).not.toContain('{zuzycie_ml}');
      expect(wynik.tresc).not.toContain('{oddechy_na_min}');
      expect(wynik.poprawnyWynik).toBeGreaterThan(0);
    });

    it('powinien zaliczać odpowiedź w granicach ±5%', () => {
      // Przykład z notatki: 30 l, 200 ml, 45 oddechów -> wynik 3.333
      const poprawnyWynik = 30 / (200 * 45 / 1000); // 3.3333333333333335
      
      expect(sprawdzZadanieObliczeniowe(3.33, poprawnyWynik)).toBe(true); // idealnie
      expect(sprawdzZadanieObliczeniowe(3.49, poprawnyWynik)).toBe(true); // w granicy 5% (5% z 3.33 to ~0.16) 3.33+0.16 = 3.49
      expect(sprawdzZadanieObliczeniowe(3.17, poprawnyWynik)).toBe(true); // w granicy 5% (3.33-0.16 = 3.17)
      
      expect(sprawdzZadanieObliczeniowe(3.55, poprawnyWynik)).toBe(false); // poza 5%
      expect(sprawdzZadanieObliczeniowe(3.10, poprawnyWynik)).toBe(false); // poza 5%
    });
  });
});
