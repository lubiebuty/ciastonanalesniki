import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { email: 'test@example.com' }, tokens: 5 },
    status: 'authenticated',
    update: vi.fn(),
  }),
}));

describe('Home Page - Subject Selection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('przedmiot=polski')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ topics: [] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          topics: [
            { id: 'topic-1', numer: 1, pytanie: 'Oblicz wartość wyrażenia', odpowiedz: '42', przedmiot: 'matematyka' }
          ],
        }),
      });
    }));
  });

  it('renders subject selection cards and defaults to Matematyka', async () => {
    render(<Home />);

    expect(screen.getByText('Wybierz przedmiot')).toBeInTheDocument();
    expect(screen.getAllByText('Matematyka').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Język Polski').length).toBeGreaterThan(0);

    // Default subject is Matematyka
    await waitFor(() => {
      expect(screen.getByText('Opanuj matematykę z natychmiastową oceną AI ✨')).toBeInTheDocument();
      expect(screen.getByText('Wybrane zadania z matematyki (1)')).toBeInTheDocument();
    });
  });

  it('switches to Język Polski when clicked and shows empty state', async () => {
    render(<Home />);

    const user = userEvent.setup();
    const polskiButton = screen.getByRole('button', { name: /Język Polski/i });
    await user.click(polskiButton);

    expect(screen.getByText('Trening zadań z Polskiego ✨')).toBeInTheDocument();
    expect(screen.getByText('Baza zadań z Języka Polskiego jest pusta')).toBeInTheDocument();
  });
});
