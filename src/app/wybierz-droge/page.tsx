'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RoadChoiceIllustration from '@/components/sketch/RoadChoiceIllustration';

export default function ChoosePathPage() {
  const router = useRouter();
  const [selectedRoad, setSelectedRoad] = useState<'with_us' | 'without_us'>('with_us');
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const handleSelect = (road: 'with_us' | 'without_us') => {
    setSelectedRoad(road);
    if (road === 'without_us') {
      setWarningMessage('Błędna odpowiedź! Spróbuj jeszcze raz.');
    } else {
      setWarningMessage(null);
    }
  };

  const handleProceed = () => {
    if (selectedRoad === 'without_us') {
      setWarningMessage('Błędna odpowiedź! Spróbuj jeszcze raz.');
      return;
    }
    router.push('/cwaniak');
  };

  return (
    <main className="min-h-screen p-2.5 sm:p-6 md:p-10 font-sketch flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full space-y-3.5 sm:space-y-6 animate-in fade-in duration-200">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="sketch-btn px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-extrabold text-slate-900"
          >
            ← Strona główna
          </Link>
          <span className="text-xs sm:text-sm font-extrabold uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md border-2 border-slate-900 bg-amber-100 shadow-[2px_2px_0px_#0f172a]">
            KROK 1 Z 2
          </span>
        </div>

        {/* Main Sketch Box */}
        <div className="sketch-box p-3.5 sm:p-8 bg-white space-y-3 sm:space-y-6 text-center">
          {/* Header Title */}
          <div className="space-y-0.5 sm:space-y-1">
            <h1 className="text-2xl sm:text-5xl font-extrabold uppercase tracking-wider text-slate-900 leading-tight">
              WYBIERZ SWOJĄ DROGĘ
            </h1>
            <p className="text-xs sm:text-lg font-bold text-slate-600">
              Kliknij jedną ze ścieżek na rysunku poniżej i zadecyduj, jak chcesz trenować.
            </p>
          </div>

          {/* Interactive Road Illustration (Page 2 from Wimpy Kid Notebook) */}
          <div className="py-1 w-full max-w-2xl mx-auto">
            <RoadChoiceIllustration
              selectedRoad={selectedRoad}
              onSelectRoad={handleSelect}
            />
          </div>

          {/* Selection Details & Feedback */}
          {selectedRoad === 'with_us' ? (
            <div className="rounded-xl border-2 border-slate-900 bg-amber-50/80 p-3 sm:p-5 text-left space-y-1.5 sm:space-y-2 shadow-[3px_3px_0px_#0f172a] animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base sm:text-xl text-slate-900 uppercase">
                  Droga z nami (Właściwa odpowiedź)
                </h3>
                <span className="text-[10px] sm:text-xs font-extrabold uppercase px-2 py-0.5 sm:px-2.5 rounded-md border border-slate-900 bg-amber-200">
                  Wybór cwaniaka
                </span>
              </div>
              <ul className="text-xs sm:text-sm font-bold text-slate-700 space-y-0.5 sm:space-y-1 list-disc list-inside">
                <li>Błyskawiczna ocena toku myślenia przez AI w kilka sekund.</li>
                <li>Podpowiedzi i wskazówki krok po kroku, gdy utkniesz na zadaniu.</li>
                <li>Sprawdzanie odpowiedzi głosem lub wpisywanie ręczne.</li>
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-slate-900 bg-rose-100 p-3 sm:p-5 text-center space-y-1.5 sm:space-y-2 shadow-[3px_3px_0px_#0f172a] animate-in shake duration-200">
              <h3 className="font-extrabold text-lg sm:text-2xl text-rose-950 uppercase">
                Błędna odpowiedź! Spróbuj jeszcze raz.
              </h3>
              <p className="text-xs sm:text-sm font-bold text-rose-800">
                Samotne błądzenie w ciemnym labiryncie to zła droga. Wybierz Drogę z Nami!
              </p>
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => handleSelect('with_us')}
                  className="sketch-btn-black px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-extrabold cursor-pointer"
                >
                  Wybierz Drogę z Nami →
                </button>
              </div>
            </div>
          )}

          {/* Bottom Slogan & Action */}
          <div className="pt-2 border-t-2 border-dashed border-slate-300 space-y-2.5 sm:space-y-4">
            <h2 className="text-lg sm:text-3xl font-extrabold tracking-widest text-slate-900 uppercase">
              WYBIERZ MĄDRZE!
            </h2>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3.5 justify-center">
              {selectedRoad === 'with_us' ? (
                <button
                  type="button"
                  onClick={handleProceed}
                  className="sketch-btn-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#0f172a]"
                >
                  <span>Idź drogą z nami</span>
                  <span aria-hidden="true">→</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleProceed}
                  className="sketch-btn bg-rose-100 border-2 border-slate-900 text-rose-950 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#0f172a]"
                >
                  <span>Błędna odpowiedź! Spróbuj jeszcze raz</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
