import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserBar from '@/components/UserBar';

describe('UserBar', () => {
  const baseUser = { email: 'test@example.com', name: 'Test User' };

  it('renders HamburgerMenu and TopRightNav components', () => {
    render(<UserBar user={baseUser} tokens={5} onSignOut={vi.fn()} />);
    
    // Check TopRightNav elements
    expect(screen.getByText('Test User')).toBeInTheDocument();
    
    // Check HamburgerMenu elements (icon button should be present)
    expect(screen.getByRole('button', { name: /otwórz menu/i })).toBeInTheDocument();
  });
});
