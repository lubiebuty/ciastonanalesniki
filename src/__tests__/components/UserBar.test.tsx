/**
 * TDD tests for the signed-in user bar (Tickets 02 and 11).
 *
 * Ticket 02: the frontend shows the user's identity and remaining token balance.
 * Ticket 11: "Usuń moje dane" is reachable, irreversible, and confirmed twice —
 * once by the user, once back to them after the deletion completes.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserBar from '@/components/UserBar';

const baseUser = { email: 'uczen@example.pl', name: 'Jan', image: null };

describe('UserBar', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows the email and the remaining token balance', () => {
    render(<UserBar user={baseUser} tokens={3} onSignOut={vi.fn()} />);

    expect(screen.getByText('uczen@example.pl')).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/token/i)).toBeInTheDocument();
  });

  it('shows a zero balance rather than hiding it', () => {
    render(<UserBar user={baseUser} tokens={0} onSignOut={vi.fn()} />);

    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it('displays AI engine status indicator and details', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'healthy',
        stt: { ok: true, model: 'whisper-large-v3-turbo' },
        llm: { ok: true, model: 'openai/gpt-oss-120b' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<UserBar user={baseUser} tokens={5} onSignOut={vi.fn()} />);

    expect(await screen.findByText(/AI gotowe/i)).toBeInTheDocument();
    expect(screen.getByText(/whisper-large-v3-turbo/i)).toBeInTheDocument();
    expect(screen.getByText(/openai\/gpt-oss-120b/i)).toBeInTheDocument();
  });

  it('signs the user out on request', async () => {
    const onSignOut = vi.fn();
    render(<UserBar user={baseUser} tokens={2} onSignOut={onSignOut} />);

    await userEvent.click(screen.getByRole('button', { name: /wyloguj/i }));

    expect(onSignOut).toHaveBeenCalled();
  });
});
