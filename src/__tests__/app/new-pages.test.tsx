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
});
