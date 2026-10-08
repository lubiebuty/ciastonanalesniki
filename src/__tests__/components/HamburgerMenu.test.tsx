import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HamburgerMenu from '@/components/HamburgerMenu';

describe('HamburgerMenu', () => {
  it('renders closed by default (only hamburger icon visible)', () => {
    render(<HamburgerMenu role="student" tokens={5} onSignOut={vi.fn()} />);
    
    // Icon button should be present
    expect(screen.getByRole('button', { name: /otwórz menu/i })).toBeInTheDocument();
    
    // Menu content shouldn't be visible
    expect(screen.queryByText(/wyloguj/i)).not.toBeInTheDocument();
  });

  it('opens menu when clicked and shows user panel elements, but logout is hidden', () => {
    render(<HamburgerMenu role="teacher" tokens={10} onSignOut={vi.fn()} />);
    
    // Click hamburger
    fireEvent.click(screen.getByRole('button', { name: /otwórz menu/i }));
    
    // Tokens, teacher link should be visible
    expect(screen.getByText(/10/)).toBeInTheDocument();
    expect(screen.getByText(/Prawa Nauczyciela/i)).toBeInTheDocument();
    
    // Logout shouldn't be immediately visible
    expect(screen.queryByRole('button', { name: /wyloguj/i })).not.toBeInTheDocument();
  });

  it('shows logout button only after clicking Zaawansowane, and calls onSignOut', () => {
    const onSignOut = vi.fn();
    render(<HamburgerMenu role="student" tokens={5} onSignOut={onSignOut} />);
    
    // Open main menu
    fireEvent.click(screen.getByRole('button', { name: /otwórz menu/i }));
    
    // Open Zaawansowane
    fireEvent.click(screen.getByRole('button', { name: /zaawansowane/i }));
    
    // Now click Wyloguj
    fireEvent.click(screen.getByRole('button', { name: /wyloguj/i }));
    
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
