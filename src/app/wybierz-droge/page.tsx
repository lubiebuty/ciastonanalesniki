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
    <main className="min-h-screen p-3 sm:p-6 md:p-10 font-sketch flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="sketch-btn px-4 py-2 text-sm font-extrabold text-slate-900"
          >
            ← Strona główna
          </Link>
          <span className="text-xs sm:text-sm font-extrabold uppercase px-3 py-1 rounded-md border-2 border-slate-900 bg-amber-100 shadow-[2px_2px_0px_#0f172a]">
            KROK 1 Z 2
          </span>
        </div>

        {/* Main Sketch Box */}
        <div className="sketch-box p-6 sm:p-8 bg-white space-y-6 text-center">
          {/* Header Title */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-wider text-slate-900 leading-tight">
              WYBIERZ SWOJĄ DROGĘ
            </h1>
            <p className="text-base sm:text-lg font-bold text-slate-600">
              Kliknij jedną ze ścieżek na rysunku poniżej i zadecyduj, jak chcesz trenować.
            </p>
          </div>

          {/* Interactive Road Illustration (Page 2 from Wimpy Kid Notebook) */}
          <div className="py-2">
            <RoadChoiceIllustration
              selectedRoad={selectedRoad}
              onSelectRoad={handleSelect}
            />
          </div>

          {/* Selection Details & Feedback */}
          {selectedRoad === 'with_us' ? (
            <div className="rounded-xl border-2 border-slate-900 bg-amber-50/80 p-4 sm:p-5 text-left space-y-2 shadow-[3px_3px_0px_#0f172a] animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 uppercase">
                  Droga z nami (Właściwa odpowiedź)
                </h3>
                <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md border border-slate-900 bg-amber-200">
                  Wybór cwaniaka
                </span>
              </div>
              <ul className="text-sm font-bold text-slate-700 space-y-1 list-disc list-inside">
                <li>Błyskawiczna ocena toku myślenia przez AI w kilka sekund.</li>
                <li>Podpowiedzi i wskazówki krok po kroku, gdy utkniesz na zadaniu.</li>
                <li>Sprawdzanie odpowiedzi głosem lub wpisywanie ręczne.</li>
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-slate-900 bg-rose-100 p-4 sm:p-5 text-center space-y-2 shadow-[3px_3px_0px_#0f172a] animate-in shake duration-200">
              <h3 className="font-extrabold text-xl sm:text-2xl text-rose-950 uppercase">
                Błędna odpowiedź! Spróbuj jeszcze raz.
              </h3>
              <p className="text-sm font-bold text-rose-800">
                Samotne błądzenie w ciemnym labiryncie to zła droga. Wybierz Drogę z Nami!
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleSelect('with_us')}
                  className="sketch-btn-black px-5 py-2 text-sm font-extrabold cursor-pointer"
                >
                  Wybierz Drogę z Nami →
                </button>
              </div>
            </div>
          )}

          {/* Bottom Slogan & Action */}
          <div className="pt-2 border-t-2 border-dashed border-slate-300 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-widest text-slate-900 uppercase">
              WYBIERZ MĄDRZE!
            </h2>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
              {selectedRoad === 'with_us' ? (
                <button
                  type="button"
                  onClick={handleProceed}
                  className="sketch-btn-black px-8 py-4 text-lg font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#0f172a]"
                >
                  <span>Idź drogą z nami</span>
                  <span aria-hidden="true">→</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleProceed}
                  className="sketch-btn bg-rose-100 border-2 border-slate-900 text-rose-950 px-8 py-4 text-lg font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#0f172a]"
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
