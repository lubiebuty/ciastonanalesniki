'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ChalkboardFrame from '@/components/sketch/ChalkboardFrame';
import WimpyCharacters from '@/components/sketch/WimpyCharacters';

type CwaniakLevel = 'tak' | 'moze' | 'nie';

export default function CzyJestesCwaniakPage() {
  const router = useRouter();
  const [level, setLevel] = useState<CwaniakLevel | null>(null);
  const [subject, setSubject] = useState<string>('matematyka');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSub = localStorage.getItem('selected_przedmiot') || 'matematyka';
      setSubject(savedSub);
    }
  }, []);

  const handleSelectLevel = (selected: CwaniakLevel) => {
    setLevel(selected);

    if (selected === 'nie') {
      setErrorMessage('Odpowiedź nie, jest nie miłe. Spróbuj jeszcze raz');
    } else if (selected === 'moze') {
      setErrorMessage('Więcej wiary w siebie!');
    } else if (selected === 'tak') {
      setErrorMessage(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cwaniak_level', 'tak');
      }
    }
  };

  const handleProceed = () => {
    if (level !== 'tak') {
      if (level === 'nie') {
        setErrorMessage('Odpowiedź nie, jest nie miłe. Spróbuj jeszcze raz');
      } else if (level === 'moze') {
        setErrorMessage('Więcej wiary w siebie!');
      } else {
        setErrorMessage('Zaznacz odpowiedź, aby przejść dalej!');
      }
      return;
    }

    router.push('/');
  };

  return (
    <main className="min-h-screen p-3 sm:p-6 md:p-10 font-sketch flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/wybierz-droge"
            className="sketch-btn px-4 py-2 text-sm font-extrabold text-slate-900"
          >
            ← Wróć do wyboru drogi
          </Link>
          <span className="text-xs sm:text-sm font-extrabold uppercase px-3 py-1 rounded-md border-2 border-slate-900 bg-amber-100 shadow-[2px_2px_0px_#0f172a]">
            KROK 2 Z 2
          </span>
        </div>

        {/* Top Comic Prompt */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-widest text-slate-900">
            JAK SIĘ CZUJESZ?
          </h1>
          <p className="text-base sm:text-lg font-bold text-slate-600">
            Odpowiedz szczerze na poniższe pytanie.
          </p>
        </div>

        {/* Central Chalkboard Frame (Page 3 from Wimpy Kid Notebook) */}
        <div className="relative">
          <ChalkboardFrame>
            <div className="p-4 sm:p-8 space-y-6 text-center">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-wider uppercase text-slate-900">
                JESTEŚ CWANIAK?
              </h2>

              {/* The 3 Comic Choice Buttons: TAK | MOŻE | NIE */}
              <div className="grid grid-cols-3 gap-3 sm:gap-5 pt-2">
                <button
                  type="button"
                  onClick={() => handleSelectLevel('tak')}
                  className={`p-4 sm:p-6 rounded-xl border-[3px] border-slate-900 font-extrabold text-xl sm:text-3xl transition-all cursor-pointer ${
                    level === 'tak'
                      ? 'bg-amber-300 shadow-[5px_5px_0px_#0f172a] scale-105'
                      : 'bg-white hover:bg-slate-50 shadow-[2px_2px_0px_#0f172a]'
                  }`}
                >
                  TAK
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectLevel('moze')}
                  className={`p-4 sm:p-6 rounded-xl border-[3px] border-slate-900 font-extrabold text-xl sm:text-3xl transition-all cursor-pointer ${
                    level === 'moze'
                      ? 'bg-amber-100 shadow-[5px_5px_0px_#0f172a] scale-105'
                      : 'bg-white hover:bg-slate-50 shadow-[2px_2px_0px_#0f172a]'
                  }`}
                >
                  MOŻE
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectLevel('nie')}
                  className={`p-4 sm:p-6 rounded-xl border-[3px] border-slate-900 font-extrabold text-xl sm:text-3xl transition-all cursor-pointer ${
                    level === 'nie'
                      ? 'bg-rose-100 shadow-[5px_5px_0px_#0f172a] scale-105'
                      : 'bg-white hover:bg-slate-50 shadow-[2px_2px_0px_#0f172a]'
                  }`}
                >
                  NIE
                </button>
              </div>

              {/* Hand-written footnote from page 3 */}
              <div className="pt-2">
                <p className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-700">
                  * WYBIERZ SWÓJ POZIOM TRUDNOŚCI
                </p>
              </div>

              {/* Dynamic feedback based on choice */}
              {errorMessage && (
                <div className="rounded-xl border-2 border-slate-900 bg-amber-100/90 p-4 text-center space-y-1 animate-in shake duration-200">
                  <p className="text-base sm:text-lg font-extrabold uppercase text-slate-950">
                    {errorMessage}
                  </p>
                </div>
              )}

              {level === 'tak' && !errorMessage && (
                <div className="rounded-xl border-2 border-slate-900 bg-amber-50 p-4 text-center space-y-1 animate-in fade-in duration-150">
                  <p className="text-base sm:text-lg font-extrabold text-slate-900 uppercase">
                    Świetnie! Prawdziwy cwaniak. Możesz przejść dalej!
                  </p>
                </div>
              )}
            </div>
          </ChalkboardFrame>

          {/* Greg & Rowley watching below the frame */}
          <div className="flex justify-end -mt-3 sm:-mt-6 pr-4 relative z-20 pointer-events-none">
            <WimpyCharacters pose="reading" />
          </div>
        </div>

        {/* Action Button */}
        <div className="sketch-box p-5 bg-white text-center space-y-3">
          {level === 'tak' ? (
            <button
              type="button"
              onClick={handleProceed}
              className="w-full sketch-btn-black p-4 text-lg sm:text-xl font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-[5px_5px_0px_#0f172a] animate-in zoom-in-95 duration-150"
            >
              <span>Zatwierdź i przejdź dalej</span>
              <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleProceed}
              className="w-full sketch-btn p-4 text-base sm:text-lg font-extrabold text-slate-500 bg-slate-100 border-2 border-slate-400 cursor-not-allowed"
            >
              <span>
                {level === 'nie'
                  ? 'Odpowiedź nie, jest nie miłe. Spróbuj jeszcze raz'
                  : level === 'moze'
                  ? 'Więcej wiary w siebie!'
                  : 'Wybierz TAK, aby przejść dalej'}
              </span>
            </button>
          )}

          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Tylko pewny siebie cwaniak może podjąć to wyzwanie
          </p>
        </div>
      </div>
    </main>
  );
}
