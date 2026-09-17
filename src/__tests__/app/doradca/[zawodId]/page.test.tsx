import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ZawodPage from '@/app/doradca/[zawodId]/page';
import { ZAWODY } from '@/lib/doradca';

// Mock komponentów mechanik, żeby upewnić się, że renderuje się poprawny
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: vi.fn()
}));
vi.mock('@/components/doradca/QuizWymagan', () => ({
  default: () => <div data-testid="mechanika-quiz">QuizWymaganMock</div>
}));
vi.mock('@/components/doradca/TimerReakcja', () => ({
  default: () => <div data-testid="mechanika-timer">TimerReakcjaMock</div>
}));
vi.mock('@/components/doradca/LamiglowkaScenariusz', () => ({
  default: () => <div data-testid="mechanika-lamiglowka">LamiglowkaMock</div>
}));
vi.mock('@/components/doradca/ZadanieObliczeniowe', () => ({
  default: () => <div data-testid="mechanika-obliczenia">ZadanieObliczenioweMock</div>
}));
vi.mock('@/components/doradca/AnimacjaBezPytan', () => ({
  default: () => <div data-testid="mechanika-animacja">AnimacjaBezPytanMock</div>
}));

vi.mock('next/link', () => {
  return {
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
      <a href={href} data-testid="next-link">
        {children}
      </a>
    )
  };
});

import { useRouter, useParams } from 'next/navigation';

describe('ZawodPage', () => {
  it('wyświetla błąd dla nieznanego zawodu', () => {
    vi.mocked(useParams).mockReturnValue({ zawodId: 'nie-ma-takiego' });
    render(<ZawodPage />);
    expect(screen.getByText(/Nie znaleziono takiego zawodu/i)).toBeInTheDocument();
  });

  it('renderuje QuizWymagan dla Architekta', () => {
    vi.mocked(useParams).mockReturnValue({ zawodId: 'architekt' });
    render(<ZawodPage />);
    expect(screen.getByTestId('mechanika-quiz')).toBeInTheDocument();
  });

  it('renderuje TimerReakcja dla Gangstera', () => {
    vi.mocked(useParams).mockReturnValue({ zawodId: 'gangster' });
    render(<ZawodPage />);
    expect(screen.getByTestId('mechanika-timer')).toBeInTheDocument();
  });
});
