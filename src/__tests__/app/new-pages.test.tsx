import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChoosePathPage from '@/app/wybierz-droge/page';
import CzyJestesCwaniakPage from '@/app/cwaniak/page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('ChoosePathPage (/wybierz-droge)', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('renders title, road illustration, and action button', () => {
    render(<ChoosePathPage />);
    expect(screen.getByText('WYBIERZ SWOJĄ DROGĘ')).toBeInTheDocument();
    expect(screen.getByText('WYBIERZ MĄDRZE!')).toBeInTheDocument();
    expect(screen.getByText('Idź drogą z nami')).toBeInTheDocument();
  });

  it('navigates to /cwaniak when clicking proceed on default path', async () => {
    render(<ChoosePathPage />);
    const user = userEvent.setup();
    const proceedBtn = screen.getByRole('button', { name: /Idź drogą z nami/i });
    await user.click(proceedBtn);
    expect(pushMock).toHaveBeenCalledWith('/cwaniak');
  });

  it('shows error message when clicking Droga bez nas and blocks proceeding', async () => {
    render(<ChoosePathPage />);
    const user = userEvent.setup();
    const wrongRoadText = screen.getByText('DROGA BEZ NAS');
    await user.click(wrongRoadText);

    expect(screen.getAllByText(/Błędna odpowiedź! Spróbuj jeszcze raz/i).length).toBeGreaterThan(0);
    expect(pushMock).not.toHaveBeenCalled();
  });
});

describe('CzyJestesCwaniakPage (/cwaniak)', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('renders JAK SIĘ CZUJESZ?, chalkboard JESTEŚ CWANIAK? and options', () => {
    render(<CzyJestesCwaniakPage />);
    expect(screen.getByText('JAK SIĘ CZUJESZ?')).toBeInTheDocument();
    expect(screen.getByText('JESTEŚ CWANIAK?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'TAK' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'MOŻE' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'NIE' })).toBeInTheDocument();
  });

  it('shows witty warning when clicking NIE', async () => {
    render(<CzyJestesCwaniakPage />);
    const user = userEvent.setup();
    const nieBtn = screen.getByRole('button', { name: 'NIE' });
    await user.click(nieBtn);

    expect(screen.getAllByText(/Prawdziwy cwaniak nigdy nie pęka przed wyzwaniem/i).length).toBeGreaterThan(0);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('shows "Więcej wiary w siebie!" when clicking MOŻE', async () => {
    render(<CzyJestesCwaniakPage />);
    const user = userEvent.setup();
    const mozeBtn = screen.getByRole('button', { name: 'MOŻE' });
    await user.click(mozeBtn);

    expect(screen.getAllByText(/Więcej wiary w siebie/i).length).toBeGreaterThan(0);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('allows proceeding only after clicking TAK', async () => {
    render(<CzyJestesCwaniakPage />);
    const user = userEvent.setup();
    const takBtn = screen.getByRole('button', { name: 'TAK' });
    await user.click(takBtn);

    expect(screen.getByText(/Świetnie! Prawdziwy cwaniak/i)).toBeInTheDocument();

    const proceedBtn = screen.getByRole('button', { name: /Zatwierdź i przejdź dalej/i });
    await user.click(proceedBtn);

    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it("supports Step 3 trick: Ultra Cwaniak -> Gratulacje, odbierz 50 tokenów with press (+50) and unpress (-51)", async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === "/api/user/cwaniak-ekstra") {
        return Promise.resolve({ ok: true, json: async () => ({ success: true, tokens: 60 }) });
      }
      if (url === "/api/user/cwaniak-odcisk") {
        return Promise.resolve({ ok: true, json: async () => ({ success: true, tokens: 9 }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    render(<CzyJestesCwaniakPage />);
    const user = userEvent.setup();

    // In step 2, header shows KROK 2 Z 2 (so user does not suspect step 3)
    expect(screen.getByText("KROK 2 Z 2")).toBeInTheDocument();

    // Click ULTRA CWANIAK
    const ultraCwaniakBtn = screen.getByRole("button", { name: /Achtung, Achtung!/i });
    await user.click(ultraCwaniakBtn);

    // Now Step 3 is revealed: KROK 3 Z 3
    expect(screen.getByText("KROK 3 Z 3")).toBeInTheDocument();
    expect(screen.getByText(/Gratulacje, odbierz 50 tokenów. Gratis./i)).toBeInTheDocument();
    expect(screen.getByText(/Dla cwaniaka/i)).toBeInTheDocument();

    const odbierzBtn = screen.getByRole("button", { name: /ODBIERZ/i });
    expect(odbierzBtn).toBeInTheDocument();

    // 1. WCIŚNIĘCIE: grants 50 tokens
    await user.click(odbierzBtn);
    expect(global.fetch).toHaveBeenCalledWith("/api/user/cwaniak-ekstra", { method: "POST" });
    expect(screen.getByText(/PRZYCISK WCIŚNIĘTY/i)).toBeInTheDocument();

    // After pressing, leads to tasks
    const przejdzBtn = screen.getByRole("button", { name: /Przejdź do zadań/i });
    expect(przejdzBtn).toBeInTheDocument();

    // 2. ODCIŚNIĘCIE: unpressing deducts 51 tokens!
    await user.click(odbierzBtn);
    expect(global.fetch).toHaveBeenCalledWith("/api/user/cwaniak-odcisk", { method: "POST" });
    expect(screen.getByText(/Odcisnąłeś przycisk! Kara dla cwaniaczka: -51 tokenów!/i)).toBeInTheDocument();

    // Press it again to get tokens back
    await user.click(odbierzBtn);
    expect(screen.getByText(/PRZYCISK WCIŚNIĘTY/i)).toBeInTheDocument();

    // Click Przejdź do zadań -> navigates to /
    await user.click(screen.getByRole("button", { name: /Przejdź do zadań/i }));
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});
