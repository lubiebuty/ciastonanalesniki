import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SubjectsPage from '@/app/subjects/page';

let pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('Subjects Page', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('renders all subject cards', () => {
    render(<SubjectsPage />);
    
    // Check if some of the subjects are rendered
    expect(screen.getByText('Matematyka')).toBeInTheDocument();
    expect(screen.getByText('Język Polski')).toBeInTheDocument();
    expect(screen.getByText('Geografia')).toBeInTheDocument();
    expect(screen.getByText('Chemia')).toBeInTheDocument();
  });

  it('clicking a subject navigates to topics selection', () => {
    render(<SubjectsPage />);
    
    fireEvent.click(screen.getByText('Matematyka'));
    
    expect(pushMock).toHaveBeenCalledWith('/topics?przedmiot=matematyka');
  });
});
