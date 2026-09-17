import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuizWymagan from '@/components/doradca/QuizWymagan';
import { Zawod } from '@/lib/doradca';

const mockZawod: Zawod = {
  id: 'test',
  nazwa: 'Test',
  kategoria: 'powazny',
  ikonaEmoji: '🧪',
  mechanika: 'quiz_wymagan',
  wymagania: ['Wymaganie 1', 'Wymaganie 2'],
  pytania: [
    { tresc: 'Pytanie 1?', opcje: ['A', 'B', 'C'], poprawnaOdpowiedz: 0 },
    { tresc: 'Pytanie 2?', opcje: ['X', 'Y', 'Z'], poprawnaOdpowiedz: 1 }
  ]
};

describe('QuizWymagan', () => {
  it('wyświetla wymagania przed quizem', () => {
    render(<QuizWymagan zawod={mockZawod} onFinish={() => {}} />);
    expect(screen.getByText('Wymaganie 1')).toBeInTheDocument();
    expect(screen.getByText('Wymaganie 2')).toBeInTheDocument();
    expect(screen.getByText(/Rozpocznij Test/i)).toBeInTheDocument();
  });

  it('przechodzi do pytań i zlicza wynik', () => {
    const onFinish = vi.fn();
    render(<QuizWymagan zawod={mockZawod} onFinish={onFinish} />);
    
    // Start quiz
    fireEvent.click(screen.getByText(/Rozpocznij Test/i));
    
    // Pytanie 1
    expect(screen.getByText('Pytanie 1?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('A')); // poprawne
    
    // Pytanie 2
    expect(screen.getByText('Pytanie 2?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('X')); // niepoprawne
    
    // Koniec
    expect(onFinish).toHaveBeenCalledWith({ poprawnych: 1, wszystkich: 2, zaliczony: false });
  });
});
