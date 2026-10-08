import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TopRightNav from '@/components/TopRightNav';

describe('TopRightNav', () => {
  it('renders user avatar and tokens', () => {
    const user = { email: 'test@example.com', name: 'Test User' };
    render(<TopRightNav user={user} tokens={42} />);
    
    // Check for tokens
    expect(screen.getByText(/42/)).toBeInTheDocument();
    
    // Check for avatar initials (T for Test User)
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('renders image when provided', () => {
    const user = { email: 'test@example.com', image: 'https://example.com/avatar.jpg' };
    render(<TopRightNav user={user} tokens={10} />);
    
    const img = screen.getByAltText('');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });
});
