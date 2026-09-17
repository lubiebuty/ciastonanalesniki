'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DebilMinigamePage() {
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hamas_debilario_clicks');
      if (saved) setClickCount(parseInt(saved, 10) || 0);
    }
  }, []);

  const handleClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem('hamas_debilario_clicks', String(next));
      }
      return next;
    });
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-10 font-sketch flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-4xl mx-auto absolute top-6 left-6 z-20">
        <Link href="/" className="sketch-btn px-4 py-2 text-sm font-extrabold text-slate-900">
          ← Wróć na stronę główną
        </Link>
      </div>

      <div className="sketch-box p-8 sm:p-12 max-w-xl w-full text-center relative z-10 space-y-8 bg-white shadow-[8px_8px_0px_#0f172a] border-[4px] border-slate-900">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-slate-900 leading-tight">
          test how much debil do you have
        </h1>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={handleClick}
            className="sketch-btn-black !bg-red-700 !border-red-900 px-6 py-4 font-black uppercase tracking-wider text-xl sm:text-2xl shadow-[6px_6px_0px_#0f172a] hover:!bg-red-800 active:translate-x-0.5 active:translate-y-0.5 transition-transform cursor-pointer select-none"
          >
            test how much debil do you have
          </button>
          {clickCount > 0 && (
            <div
              className="sketch-box px-6 py-3.5 bg-amber-200 border-[3px] border-slate-900 shadow-[4px_4px_0px_#0f172a] text-center min-w-[75px] animate-in fade-in zoom-in-95 duration-150"
              title="Ilość kliknięć"
            >
              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-sketch leading-none">
                {clickCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
