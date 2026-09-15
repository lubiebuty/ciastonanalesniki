import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultsPage from '@/app/results/page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockUpdateSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { email: 'test@example.com' }, tokens: 5 },
    status: 'authenticated',
    update: mockUpdateSession,
  }),
}));

describe('ResultsPage - Repeat Answer & Attempt Tracking', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
    mockUpdateSession.mockReset();
  });

  it('renders attempt badges and score progression for repeated attempts', async () => {
    const mockSessions = [
      // Older attempt (Attempt 1): score 4
      {
        id: 'session-1',
        topic_id: 'topic-101',
        numer: 42,
        pytanie: 'Rozwiąż równanie kwadratowe',
        odpowiedz: 'x = 2 lub x = 3',
        status: 'completed',
        score: 4,
        is_correct: 0,
        feedback: 'Częściowe rozwiązanie, brak sprawdzenia.',
        created_at: '2026-09-14T10:00:00Z',
      },
      // Newer attempt (Attempt 2): score 9
      {
        id: 'session-2',
        topic_id: 'topic-101',
        numer: 42,
        pytanie: 'Rozwiąż równanie kwadratowe',
        odpowiedz: 'x = 2 lub x = 3 z pełnym wyliczeniem delty',
        status: 'completed',
        score: 9,
        is_correct: 1,
        feedback: 'Świetnie rozpisane!',
        created_at: '2026-09-14T11:00:00Z',
      },
    ];

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sessions: mockSessions }),
    }));

    render(<ResultsPage />);

    // Check header and stats render
    await waitFor(() => {
      expect(screen.getByText('Moje wyniki i postępy')).toBeInTheDocument();
    });

    // There must be only ONE top-level card for this question
    expect(screen.getAllByText('Zadanie #42')).toHaveLength(1);
    expect(screen.getByText('2 próby')).toBeInTheDocument();
    expect(screen.getByText('+5 pkt (Lepsze zrozumienie)')).toBeInTheDocument();

    // Before clicking, the detailed attempt breakdown is collapsed
    expect(screen.queryByText('Jak zmieniała się Twoja wiedza z tego pytania')).not.toBeInTheDocument();

    // Click to expand the question card
    const user = userEvent.setup();
    await user.click(screen.getByText('Rozwiąż równanie kwadratowe'));

    // When expanded, the knowledge evolution section and both attempts are shown
    expect(screen.getByText('Jak zmieniała się Twoja wiedza z tego pytania')).toBeInTheDocument();
    expect(screen.getByText(/Wzrost poziomu zrozumienia: Twój wynik wzrósł o/)).toBeInTheDocument();
    expect(screen.getAllByText(/Próba #1/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Próba #2/).length).toBeGreaterThan(0);
  });

  it('allows clicking "Powtórz to zadanie (Nowa próba)" to trigger a new session', async () => {
    const mockSessions = [
      {
        id: 'session-1',
        topic_id: 'topic-101',
        numer: 42,
        pytanie: 'Rozwiąż równanie kwadratowe',
        odpowiedz: 'x = 2',
        status: 'completed',
        score: 6,
        is_correct: 1,
        feedback: 'Dobrze',
        created_at: '2026-09-14T10:00:00Z',
      },
    ];

    const fetchMock = vi.fn().mockImplementation((url: string, options?: RequestInit) => {
      if (url === '/api/sessions' && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            session: { id: 'session-new-999', topic_id: 'topic-101', status: 'active' },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ sessions: mockSessions }),
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<ResultsPage />);

    await waitFor(() => {
      expect(screen.getByText('Zadanie #42')).toBeInTheDocument();
    });

    const user = userEvent.setup();

    // Expand the session card by clicking on the question
    const questionCard = screen.getByText('Rozwiąż równanie kwadratowe');
    await user.click(questionCard);

    // Repeat button should now be visible
    const repeatButton = await screen.findByRole('button', { name: /Powtórz to zadanie \(Nowa próba\)/i });
    expect(repeatButton).toBeInTheDocument();

    await user.click(repeatButton);

    // Verify POST /api/sessions was called with topicId
    expect(fetchMock).toHaveBeenCalledWith('/api/sessions', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ topicId: 'topic-101' }),
    }));

    // Verify session tokens updated and router pushed to new exam with prevScore
    await waitFor(() => {
      expect(mockUpdateSession).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/exam/session-new-999?prevScore=6');
    });
  });
});
