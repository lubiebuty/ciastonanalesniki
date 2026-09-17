import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ZadanieObliczeniowe from '@/components/doradca/ZadanieObliczeniowe';
import { Zawod } from '@/lib/doradca';

const mockZawod: Zawod = {
  id: 'szambonurek',
  nazwa: 'Szambonurek',
  kategoria: 'zartobliwy',
  ikonaEmoji: '🤿',
  mechanika: 'zadanie_obliczeniowe',
  zadanieObliczeniowe: {
    szablonTresci: 'Masz butlę {pojemnosc} l, {zuzycie_ml} ml/oddech, {oddechy_na_min} oddech/min',
    zakresyLosowania: {
      pojemnosc: [30, 30], // stale wartosci dla latwego testowania
      zuzycie_ml: [200, 200],
      oddechy_na_min: [45, 45]
    },
    wzorNaWynik: 'pojemnosc / (zuzycie_ml * oddechy_na_min / 1000)'
  }
};

describe('ZadanieObliczeniowe', () => {
  it('wyświetla poprawnie wylosowaną treść i zgłasza błąd przy złym wyniku', () => {
    const onFinish = vi.fn();
    render(<ZadanieObliczeniowe zawod={mockZawod} onFinish={onFinish} />);
    
    expect(screen.getByText(/Masz butlę 30 l, 200 ml\/oddech, 45 oddech\/min/i)).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText('Wpisz liczbę...');
    fireEvent.change(input, { target: { value: '999' } });
    fireEvent.click(screen.getByText(/Sprawdź/i));
    
    expect(screen.getByText(/Błędny wynik/i)).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('zalicza zadanie przy poprawnym wyniku w granicach 5%', () => {
    const onFinish = vi.fn();
    render(<ZadanieObliczeniowe zawod={mockZawod} onFinish={onFinish} />);
    
    const input = screen.getByPlaceholderText('Wpisz liczbę...');
    // Poprawny to 3.333333333
    fireEvent.change(input, { target: { value: '3.33' } }); 
    fireEvent.click(screen.getByText(/Sprawdź/i));
    
    expect(onFinish).toHaveBeenCalledWith({ poprawnych: 1, wszystkich: 1, zaliczony: true });
  });
});
