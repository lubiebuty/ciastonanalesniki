import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TimerReakcja from '@/components/doradca/TimerReakcja';
import { Zawod } from '@/lib/doradca';

const mockZawod: Zawod = {
  id: 'gangster',
  nazwa: 'Gangster',
  kategoria: 'zartobliwy',
  ikonaEmoji: '🚔',
  mechanika: 'timer_reakcja',
  scenariuszTimer: {
    tresc: 'Goni cię policja! Co robisz?',
    limitSekund: 3,
    opcje: ['Uciekaj', 'Walcz', 'Poddaj się', 'Skacz'],
    animacjaPorazki: 'Złapali cię!'
  }
};

describe('TimerReakcja', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('pozwala wygrać jeśli klikniesz szybko', () => {
    const onFinish = vi.fn();
    render(<TimerReakcja zawod={mockZawod} onFinish={onFinish} />);
    
    fireEvent.click(screen.getByText('Zaczynamy!'));
    
    expect(screen.getByText('Goni cię policja! Co robisz?')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Uciekaj'));
    
    expect(screen.getByText('Udało się!')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Zakończ i wróć'));
    
    expect(onFinish).toHaveBeenCalledWith({ poprawnych: 1, wszystkich: 1, zaliczony: true });
  });

  it('przegrywa po upływie czasu', () => {
    const onFinish = vi.fn();
    render(<TimerReakcja zawod={mockZawod} onFinish={onFinish} />);
    
    fireEvent.click(screen.getByText('Zaczynamy!'));
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(screen.getByText('Złapali cię!')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText(/Zakończ/i));
    
    expect(onFinish).toHaveBeenCalledWith({ poprawnych: 0, wszystkich: 1, zaliczony: false });
  });
});
