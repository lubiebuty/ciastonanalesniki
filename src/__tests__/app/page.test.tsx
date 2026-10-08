import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from '@/app/page';

// Mock the next/navigation and next-auth
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { name: 'Test User' }, tokens: 5 },
    status: 'authenticated',
    update: vi.fn(),
  }),
}));

describe('Home Page - Minimalist', () => {
  it('renders central navigation buttons', () => {
    render(<Home />);
    
    expect(screen.getByRole('link', { name: /wybierz przedmiot/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /test how much debil do you have/i })).toBeInTheDocument();
  });

  it('increments debil counter on click', () => {
    render(<Home />);
    
    const debilButton = screen.getByRole('button', { name: /test how much debil do you have/i });
    
    // Initially no counter should be visible
    expect(screen.queryByTitle('Ilość kliknięć')).not.toBeInTheDocument();
    
    // Click button
    fireEvent.click(debilButton);
    
    // Counter should show 1
    const counter = screen.getByTitle('Ilość kliknięć');
    expect(counter).toBeInTheDocument();
    expect(counter).toHaveTextContent('1');
    
    // Click again
    fireEvent.click(debilButton);
    expect(counter).toHaveTextContent('2');
  });
});
