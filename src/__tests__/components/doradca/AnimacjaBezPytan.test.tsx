import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AnimacjaBezPytan from '@/components/doradca/AnimacjaBezPytan';
import { Zawod } from '@/lib/doradca';

const mockZawod: Zawod = {
  id: 'kopanie_rowow',
  nazwa: 'Kopanie rowów',
  kategoria: 'zartobliwy',
  ikonaEmoji: '⛏️',
  mechanika: 'animacja_bez_pytan'
};

describe('AnimacjaBezPytan', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uruchamia animację i automatycznie kończy wyzwanie po upływie czasu', () => {
    const onFinish = vi.fn();
    render(<AnimacjaBezPytan zawod={mockZawod} onFinish={onFinish} />);
    
    const startButton = screen.getByRole('button', { name: /Zacznij/i });
    expect(startButton).toBeInTheDocument();
    
    // Klikamy start
    fireEvent.click(startButton);
    expect(screen.getByText(/Trwa praca/i)).toBeInTheDocument();
    
    // Przewijamy czas o 4 sekundy
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    
    expect(screen.getByText('Gratulacje!')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText(/Zakończ/i));
    
    // Wynik zawsze 100% dla tej mechaniki
    expect(onFinish).toHaveBeenCalledWith({ poprawnych: 1, wszystkich: 1, zaliczony: true });
  });
});
