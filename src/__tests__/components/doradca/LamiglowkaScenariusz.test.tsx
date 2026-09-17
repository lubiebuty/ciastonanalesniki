import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LamiglowkaScenariusz from '@/components/doradca/LamiglowkaScenariusz';
import { Zawod } from '@/lib/doradca';

const mockZawod: Zawod = {
  id: 'haker',
  nazwa: 'Haker',
  kategoria: 'zartobliwy',
  ikonaEmoji: '💻',
  mechanika: 'lamiglowka',
  lamiglowki: [
    { tresc: 'Zgadnij 1', odpowiedz: 'Odp1' },
    { tresc: 'Zgadnij 2', odpowiedz: 'Odp2' }
  ]
};

describe('LamiglowkaScenariusz', () => {
  it('wyświetla błąd przy złej odpowiedzi i pozwala spróbować ponownie', () => {
    const onFinish = vi.fn();
    render(<LamiglowkaScenariusz zawod={mockZawod} onFinish={onFinish} />);
    
    expect(screen.getByText('Zgadnij 1')).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText('Wpisz odpowiedź...');
    fireEvent.change(input, { target: { value: 'Zle' } });
    fireEvent.click(screen.getByText(/Sprawdź/i));
    
    expect(screen.getByText(/Błędna odpowiedź/i)).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('przechodzi dalej przy dobrej odpowiedzi ignorując wielkość liter', () => {
    const onFinish = vi.fn();
    render(<LamiglowkaScenariusz zawod={mockZawod} onFinish={onFinish} />);
    
    const input = screen.getByPlaceholderText('Wpisz odpowiedź...');
    fireEvent.change(input, { target: { value: 'oDp1' } }); // case-insensitive
    fireEvent.click(screen.getByText(/Sprawdź/i));
    
    // Przechodzi do drugiej zagadki
    expect(screen.getByText('Zgadnij 2')).toBeInTheDocument();
    
    const input2 = screen.getByPlaceholderText('Wpisz odpowiedź...');
    fireEvent.change(input2, { target: { value: 'ODP2' } });
    fireEvent.click(screen.getByText(/Sprawdź/i));
    
    expect(onFinish).toHaveBeenCalledWith({ poprawnych: 2, wszystkich: 2, zaliczony: true });
  });
});
