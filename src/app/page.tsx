'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [debilClicks, setDebilClicks] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hamas_debilario_clicks');
      if (saved) setDebilClicks(parseInt(saved, 10) || 0);
    }
  }, []);

  const handleHamasDebilarioClick = () => {
    setDebilClicks((prev) => {
      const next = prev + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem('hamas_debilario_clicks', String(next));
      }
      return next;
    });
  };

  return (
    <main className="min-h-screen p-3 sm:p-6 md:p-10 font-sketch flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8 flex flex-col items-center">
        
        {/* Zminimalizowane Deale na samej górze */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/frejer" className="hover:scale-[1.02] transition-transform duration-300">
            <img
              src="/images/frejer_sticker.jpg"
              alt="UWAGA NIE KLIKAJ TU TO PRZYCISK TYLKO DLA FRAJERÓW"
              className="w-32 sm:w-40 object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.2)]"
            />
          </Link>
          <Link href="/doradca" className="group">
            <img 
              src="/images/dice_header_transparent.png" 
              alt="DICE Doradca Zawodowy DICE" 
              className="h-16 sm:h-20 object-contain opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 drop-shadow-[0_0_5px_rgba(0,0,0,0.3)]" 
            />
          </Link>
        </div>

        {/* Zminimalizowana Strona w budowie */}
        <div className="w-full max-w-sm mb-2 bg-yellow-300 border-2 border-slate-900 p-1 text-center shadow-[2px_2px_0px_#0f172a]">
          <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase">⚠️ W BUDOWIE ⚠️</h2>
        </div>

        {/* Centralne przyciski nawigacyjne */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full">
          <Link
            href="/subjects"
            className="sketch-btn px-8 py-4 text-xl font-extrabold text-center inline-flex items-center justify-center gap-2"
          >
            Wybierz przedmiot
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleHamasDebilarioClick}
              className="sketch-btn-black !bg-red-700 !border-red-900 px-6 py-4 text-lg font-extrabold text-center inline-flex items-center justify-center gap-2 hover:!bg-red-800 cursor-pointer shadow-[4px_4px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 select-none"
            >
              <span>test how much debil do you have</span>
            </button>
            {debilClicks > 0 && (
              <div
                className="sketch-box px-4 py-2 bg-amber-200 border-[3px] border-slate-900 shadow-[3px_3px_0px_#0f172a] flex items-center justify-center min-w-[55px] animate-in fade-in zoom-in-95 duration-150"
                title="Ilość kliknięć"
              >
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-sketch leading-none">
                  {debilClicks}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
