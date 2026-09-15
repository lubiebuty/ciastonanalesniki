import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NoTokensBanner from '@/components/NoTokensBanner';

describe('NoTokensBanner', () => {
  it('renders zero token alert and contact email', () => {
    render(<NoTokensBanner />);

    expect(screen.getByText('Limit tokenów wyczerpany')).toBeInTheDocument();
    expect(screen.getByText('0 tokenów na koncie')).toBeInTheDocument();
    expect(screen.getByText(/zwiększenie liczby tokenów i przedłużenie dostępu/i)).toBeInTheDocument();
    expect(screen.getByText('Napisz: ciastonanalesniki@gmail.com')).toBeInTheDocument();
    expect(screen.getByText(/Możesz nadal przeglądać wszystkie zadania oraz sprawdzać swoje wyniki/i)).toBeInTheDocument();
  });

  it('contains correct mailto link with prefilled subject', () => {
    render(<NoTokensBanner />);

    const link = screen.getByRole('link', { name: /ciastonanalesniki@gmail.com/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('mailto:ciastonanalesniki@gmail.com'));
    expect(link).toHaveAttribute('href', expect.stringContaining('subject='));
  });
});
