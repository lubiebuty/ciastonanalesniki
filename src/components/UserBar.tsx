import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HamburgerMenu from './HamburgerMenu';
import TopRightNav from './TopRightNav';

interface UserBarProps {
  user: { email: string; name?: string | null; image?: string | null };
  tokens: number;
  role?: string;
  onSignOut: () => void;
}

export default function UserBar({ user, tokens, role, onSignOut }: UserBarProps) {
  return (
    <div className="flex items-center justify-between w-full mb-4 sm:mb-6 pointer-events-none">
      {/* Prawa strona - połączone przez HamburgerMenu */}
      <div className="pointer-events-auto">
        <HamburgerMenu tokens={tokens} role={role} onSignOut={onSignOut} />
      </div>

      {/* Prawa strona - Profil i Tokeny */}
      <div className="pointer-events-auto">
        <TopRightNav user={user} tokens={tokens} />
      </div>
    </div>
  );
}
