import { describe, it, expect } from 'vitest';
import { ZAWODY, Zawod } from '@/lib/doradca';

describe('Doradca Zawodowy - Baza Danych', () => {
  it('powinien zawierać poprawną strukturę dla wszystkich zawodów', () => {
    expect(Array.isArray(ZAWODY)).toBe(true);
    expect(ZAWODY.length).toBeGreaterThan(0);

    ZAWODY.forEach((zawod: Zawod) => {
      expect(zawod).toHaveProperty('id');
      expect(zawod).toHaveProperty('nazwa');
      expect(zawod).toHaveProperty('kategoria');
      expect(zawod).toHaveProperty('ikonaEmoji');
      expect(zawod).toHaveProperty('mechanika');

      expect(['powazny', 'zartobliwy']).toContain(zawod.kategoria);
      expect(['quiz_wymagan', 'timer_reakcja', 'lamiglowka', 'zadanie_obliczeniowe', 'animacja_bez_pytan']).toContain(zawod.mechanika);
    });
  });

  it('powinien zawierać zawod Architekt z odpowiednimi danymi', () => {
    const architekt = ZAWODY.find(z => z.id === 'architekt');
    expect(architekt).toBeDefined();
    expect(architekt?.mechanika).toBe('quiz_wymagan');
    expect(architekt?.wymagania?.length).toBeGreaterThan(0);
    expect(architekt?.pytania?.length).toBe(3);
    
    architekt?.pytania?.forEach(pytanie => {
      expect(pytanie.opcje.length).toBeGreaterThan(0);
      expect(pytanie.poprawnaOdpowiedz).toBeGreaterThanOrEqual(0);
      expect(pytanie.poprawnaOdpowiedz).toBeLessThan(pytanie.opcje.length);
    });
  });

  it('powinien zawierać zawod Fizyk (nie czizyk)', () => {
    const fizyk = ZAWODY.find(z => z.id === 'fizyk');
    expect(fizyk).toBeDefined();
    expect(fizyk?.nazwa).toBe('Fizyk');
  });

  it('powinien poprawnie konfigurować Gangstera', () => {
    const gangster = ZAWODY.find(z => z.id === 'gangster');
    expect(gangster).toBeDefined();
    expect(gangster?.kategoria).toBe('zartobliwy');
    expect(gangster?.mechanika).toBe('timer_reakcja');
    expect(gangster?.scenariuszTimer).toBeDefined();
    expect(gangster?.scenariuszTimer?.limitSekund).toBe(3);
    expect(gangster?.scenariuszTimer?.opcje.length).toBe(4);
  });
});
