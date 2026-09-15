import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NoTokensModal from '@/components/NoTokensModal';

describe('NoTokensModal', () => {
  it('does not render when isOpen is false', () => {
    render(<NoTokensModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Brak dostępnych tokenów')).not.toBeInTheDocument();
  });

  it('renders contact email and explanation when open', () => {
    render(<NoTokensModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Brak dostępnych tokenów')).toBeInTheDocument();
    expect(screen.getByText('ciastonanalesniki@gmail.com')).toBeInTheDocument();
    expect(screen.getByText(/zwiększyć liczbę tokenów i przedłużyć dostęp/i)).toBeInTheDocument();
    expect(screen.getByText(/Przeglądać wszystkie zadania ze wszystkich przedmiotów/i)).toBeInTheDocument();
    expect(screen.getByText(/Przeglądać swoje dotychczasowe próby i analizy/i)).toBeInTheDocument();
  });

  it('triggers onClose callback when user clicks "Wróć"', () => {
    const handleClose = vi.fn();
    render(<NoTokensModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: /Wróć/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
