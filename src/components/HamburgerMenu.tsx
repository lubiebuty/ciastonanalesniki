'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface HamburgerMenuProps {
  tokens: number;
  role?: string;
  onSignOut: () => void;
}

export default function HamburgerMenu({ tokens, role, onSignOut }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="relative z-50">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowAdvanced(false);
        }}
        className="p-2 border-2 border-slate-900 rounded-lg bg-white shadow-[2px_2px_0px_#0f172a] hover:bg-slate-50 transition-colors"
        aria-label={isOpen ? "Zamknij menu" : "Otwórz menu"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0px_#0f172a] flex flex-col gap-4 font-sketch">
          <div className="flex flex-col gap-1 border-b-2 border-dashed border-slate-300 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Twoje zasoby</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-slate-900">{tokens}</span>
              <span className="text-sm font-bold text-slate-700">tokenów</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {role === 'teacher' && (
              <Link
                href="/teacher/classes"
                className="w-full text-center rounded-lg border-2 border-purple-900 bg-purple-100 hover:bg-purple-200 px-3 py-2 text-sm font-bold text-purple-900 shadow-[2px_2px_0px_#581c87]"
                onClick={() => setIsOpen(false)}
              >
                Prawa Nauczyciela
              </Link>
            )}

            {/* Accordion / sekcja zaawansowana do wylogowania */}
            <div className="mt-2 border-t-2 border-dashed border-slate-300 pt-3">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full text-left text-xs font-bold text-slate-500 uppercase flex items-center justify-between"
              >
                <span>Zaawansowane</span>
                <span>{showAdvanced ? '−' : '+'}</span>
              </button>
              
              {showAdvanced && (
                <div className="mt-3">
                  <button
                    onClick={onSignOut}
                    className="w-full text-center rounded-lg border-2 border-slate-900 bg-rose-50 hover:bg-rose-100 px-3 py-2 text-sm font-bold text-rose-700 shadow-[2px_2px_0px_#0f172a]"
                  >
                    Wyloguj
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
