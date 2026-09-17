import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DoradcaPage from '@/app/doradca/page';

// Mock Next.js router i Link
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

vi.mock('next/font/google', () => ({
  Creepster: () => ({
    style: { fontFamily: 'mocked' },
    className: 'mocked-font',
  }),
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

describe('DoradcaPage', () => {
  it('wyświetla nagłówek i podział na kategorie', () => {
    render(<DoradcaPage />);
    
    expect(screen.getAllByText(/Doradca Zawodowy/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Poważne/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ZIOMAL/i).length).toBeGreaterThan(0);
  });

  it('renderuje linki do wszystkich zawodów', () => {
    render(<DoradcaPage />);
    
    // Architekt i Gangster to przykłady zawodów z bazy
    expect(screen.getByText(/Architekt/i)).toBeInTheDocument();
    expect(screen.getByText(/Gangster/i)).toBeInTheDocument();
    
    const links = screen.getAllByTestId('next-link');
    expect(links.length).toBeGreaterThan(5); // Minimum kilka zawodów
  });
});
