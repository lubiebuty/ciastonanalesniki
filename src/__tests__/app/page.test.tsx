import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockUseSession = vi.fn().mockReturnValue({
  data: { user: { email: 'test@example.com' }, tokens: 5 },
  status: 'authenticated',
  update: vi.fn(),
});

vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

describe('Home Page - Subject Selection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
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
      expect(screen.getByText('Opanuj matematykę z natychmiastową oceną AI')).toBeInTheDocument();
      expect(screen.getByText('Wybrane zadania z matematyki (1)')).toBeInTheDocument();
    });
  });

  it('switches to Język Polski when clicked and shows empty state', async () => {
    render(<Home />);

    const user = userEvent.setup();
    const polskiButton = screen.getByRole('button', { name: /Język Polski/i });
    await user.click(polskiButton);

    expect(screen.getByText('Trening zadań z Polskiego')).toBeInTheDocument();
    expect(screen.getByText('Brak zadań z polskiego w bazie danych.')).toBeInTheDocument();
  });

  it('switches to Geografia when clicked and renders chapter progression', async () => {
    render(<Home />);

    const user = userEvent.setup();
    const geografiaButton = screen.getByRole('button', { name: /Geografia/i });
    await user.click(geografiaButton);

    expect(screen.getByText('Trening Geograficzny — 13 Działów')).toBeInTheDocument();
    expect(screen.getByText('Działy z Geografii (13 działów)')).toBeInTheDocument();
    expect(screen.getByText(/Dział I: Mapa Polski/i)).toBeInTheDocument();
  });

  it('shows NoTokensModal instead of starting task when user has 0 tokens', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { email: 'zero@example.com' }, tokens: 0 } as any,
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Wybrane zadania z matematyki (1)')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const topicButton = screen.getByRole('button', { name: /#1/i });
    await user.click(topicButton);

    expect(screen.getByText('Brak dostępnych tokenów')).toBeInTheDocument();
    expect(screen.getByText('ciastonanalesniki@gmail.com')).toBeInTheDocument();

    // Restore
    mockUseSession.mockReturnValue({
      data: { user: { email: 'test@example.com' }, tokens: 5 },
      status: 'authenticated',
      update: vi.fn(),
    });
  });
});
