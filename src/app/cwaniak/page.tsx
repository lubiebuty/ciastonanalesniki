'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ChalkboardFrame from '@/components/sketch/ChalkboardFrame';
import WimpyCharacters from '@/components/sketch/WimpyCharacters';

type CwaniakLevel = 'tak' | 'moze' | 'nie';

function useSafeSession() {
  try {
    return useSession();
  } catch {
    return { data: null, status: 'unauthenticated', update: async () => null };
  }
}

export default function CzyJestesCwaniakPage() {
  const router = useRouter();
  const session = useSafeSession();
  const [currentStep, setCurrentStep] = useState<2 | 3>(2);
  const [level, setLevel] = useState<CwaniakLevel | null>(null);
  const [subject, setSubject] = useState<string>('matematyka');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessingToken, setIsProcessingToken] = useState<boolean>(false);
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [toggleFeedback, setToggleFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSub = localStorage.getItem('selected_przedmiot') || 'matematyka';
      setSubject(savedSub);
    }
  }, []);

  const handleSelectLevel = (selected: CwaniakLevel) => {
    setLevel(selected);

    if (selected === 'nie') {
      setErrorMessage('„NIE”? Chyba żartujesz! Prawdziwy cwaniak nigdy nie pęka przed wyzwaniem. Kliknij TAK!');
    } else if (selected === 'moze') {
      setErrorMessage('„MOŻE”? Nie ma miejsca na wahanie! Uwierz w siebie i kliknij TAK!');
    } else if (selected === 'tak') {
      setErrorMessage(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cwaniak_level', 'tak');
      }
    }
  };

  // Triggers Step 3 ("podpucha") when clicking Ultra cwaniak
  const handleSelectUltraCwaniak = () => {
    setLevel('tak');
    if (typeof window !== 'undefined') {
      localStorage.setItem('cwaniak_level', 'tak');
    }
    setCurrentStep(3);
  };

  // Toggle mechanic for the "Odbierz" button in Step 3
  const handleToggleOdbierz = async () => {
    if (isProcessingToken) return;
    setIsProcessingToken(true);

    if (!isPressed) {
      // 1. WCIŚNIĘCIE: Dodaje 50 tokenów
      try {
        const res = await fetch('/api/user/cwaniak-ekstra', {
          method: 'POST',
        });
        if (res.ok && session && typeof session.update === 'function') {
          await session.update();
        }
      } catch {
        // Fallback
      }
      setIsPressed(true);
      setToggleFeedback('Wciśnięto! Zgarnąłeś 50 tokenów gratis! Nie odtłaczaj przycisku, bo odejmie Ci 51!');
      setIsProcessingToken(false);
    } else {
      // 2. ODCIŚNIĘCIE: Odejmuje 51 tokenów
      try {
        const res = await fetch('/api/user/cwaniak-odcisk', {
          method: 'POST',
        });
        if (res.ok && session && typeof session.update === 'function') {
          await session.update();
        }
      } catch {
        // Fallback
      }
      setIsPressed(false);
      setToggleFeedback('Odcisnąłeś przycisk! Kara dla cwaniaczka: -51 tokenów! Wciśnij z powrotem, aby odzyskać!');
      setIsProcessingToken(false);
    }
  };

  const handleProceedToTasks = () => {
    router.push('/');
  };

  const handleProceedStep2 = () => {
    if (level !== 'tak') {
      if (level === 'nie') {
        setErrorMessage('„NIE”? Chyba żartujesz! Prawdziwy cwaniak nigdy nie pęka przed wyzwaniem. Kliknij TAK!');
      } else if (level === 'moze') {
        setErrorMessage('„MOŻE”? Nie ma miejsca na wahanie! Uwierz w siebie i kliknij TAK!');
      } else {
        setErrorMessage('Zaznacz odpowiedź, aby przejść dalej!');
      }
      return;
    }

    router.push('/');
  };

  return (
    <main className="min-h-screen p-2.5 sm:p-6 md:p-10 font-sketch flex flex-col justify-between">
      <div className="max-w-2xl sm:max-w-3xl mx-auto w-full space-y-3 sm:space-y-6 animate-in fade-in duration-200">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          {currentStep === 2 ? (
            <Link
              href="/wybierz-droge"
              className="sketch-btn px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-extrabold text-slate-900"
            >
              ← Wróć do wyboru drogi
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="sketch-btn px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-extrabold text-slate-900"
            >
              ← Wróć do kroku 2
            </button>
          )}

          {/* Podpucha: w kroku 1 i 2 pisze "KROK 1 Z 2" i "KROK 2 Z 2", a w kroku 3 ujawnia się "KROK 3 Z 3"! */}
          <span className="text-xs sm:text-sm font-extrabold uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md border-2 border-slate-900 bg-amber-100 shadow-[2px_2px_0px_#0f172a]">
            {currentStep === 2 ? 'KROK 2 Z 2' : 'KROK 3 Z 3'}
          </span>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            KROK 2: JESTEŚ CWANIAK? (Z OPCJĄ ULTRA CWANIAK)
            ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <>
            {/* Top Comic Prompt */}
            <div className="text-center space-y-0.5 sm:space-y-2">
              <h1 className="text-2xl sm:text-5xl font-extrabold uppercase tracking-widest text-slate-900">
                JAK SIĘ CZUJESZ?
              </h1>
              <p className="text-xs sm:text-lg font-bold text-slate-600">
                Odpowiedz szczerze na poniższe pytanie.
              </p>
            </div>

            {/* Central Chalkboard Frame */}
            <div className="relative">
              <ChalkboardFrame className="p-2 sm:p-5">
                <div className="p-2 sm:p-8 space-y-3 sm:space-y-6 text-center">
                  <h2 className="text-2xl sm:text-5xl font-extrabold tracking-wider uppercase text-slate-900">
                    JESTEŚ CWANIAK?
                  </h2>

                  {/* The 3 Comic Choice Buttons: TAK | MOŻE | NIE */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-5 pt-1 sm:pt-2">
                    <button
                      type="button"
                      onClick={() => handleSelectLevel('tak')}
                      className={`py-2 sm:py-6 px-2 sm:px-4 rounded-xl border-[2.5px] sm:border-[3px] border-slate-900 font-extrabold text-lg sm:text-3xl transition-all cursor-pointer ${
                        level === 'tak'
                          ? 'bg-amber-300 shadow-[4px_4px_0px_#0f172a] sm:shadow-[5px_5px_0px_#0f172a] scale-105'
                          : 'bg-white hover:bg-slate-50 shadow-[2px_2px_0px_#0f172a]'
                      }`}
                    >
                      TAK
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectLevel('moze')}
                      className={`py-2 sm:py-6 px-2 sm:px-4 rounded-xl border-[2.5px] sm:border-[3px] border-slate-900 font-extrabold text-lg sm:text-3xl transition-all cursor-pointer ${
                        level === 'moze'
                          ? 'bg-amber-100 shadow-[4px_4px_0px_#0f172a] sm:shadow-[5px_5px_0px_#0f172a] scale-105'
                          : 'bg-white hover:bg-slate-50 shadow-[2px_2px_0px_#0f172a]'
                      }`}
                    >
                      MOŻE
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectLevel('nie')}
                      className={`py-2 sm:py-6 px-2 sm:px-4 rounded-xl border-[2.5px] sm:border-[3px] border-slate-900 font-extrabold text-lg sm:text-3xl transition-all cursor-pointer ${
                        level === 'nie'
                          ? 'bg-rose-100 shadow-[4px_4px_0px_#0f172a] sm:shadow-[5px_5px_0px_#0f172a] scale-105'
                          : 'bg-white hover:bg-slate-50 shadow-[2px_2px_0px_#0f172a]'
                      }`}
                    >
                      NIE
                    </button>
                  </div>

                  {/* 💥 PRZYCISK ULTRA CWANIAK (Prowadzi do Kroku 3 - Podpuchy) 💥 */}
                  <div className="pt-4 sm:pt-6 relative">
                    <div className="relative group max-w-lg mx-auto">
                      {/* Żółta poświata w kolorze bonusa */}
                      <div className="absolute -inset-5 sm:-inset-8 bg-amber-300 rounded-3xl blur-2xl opacity-90 group-hover:opacity-100 animate-pulse pointer-events-none -z-30" />
                      <div className="absolute -inset-3 sm:-inset-5 bg-amber-300 rounded-2xl blur-lg opacity-95 group-hover:opacity-100 pointer-events-none -z-25" />

                      {/* Żółta gwiazda wybuchu SVG */}
                      <div className="absolute -inset-6 sm:-inset-9 pointer-events-none -z-20 flex items-center justify-center">
                        <svg
                          viewBox="0 0 330 135"
                          className="w-full h-full text-amber-300 fill-current opacity-95 drop-shadow-[0_0_24px_rgba(252,211,77,0.95)] animate-pulse"
                          preserveAspectRatio="none"
                        >
                          <polygon points="0,67 16,40 3,25 32,23 38,0 64,19 85,2 102,25 137,6 151,31 189,0 195,27 230,6 238,31 271,8 277,33 315,21 300,57 326,67 302,84 319,105 285,95 274,122 240,99 230,122 193,99 180,124 143,97 126,122 89,99 72,122 45,97 23,114 19,85 0,81 13,70" />
                        </svg>
                      </div>

                      {/* Czerwona zębata gwiazda wybuchu */}
                      <div className="absolute -inset-3 sm:-inset-5 pointer-events-none -z-10 flex items-center justify-center">
                        <svg
                          viewBox="0 0 300 110"
                          className="w-full h-full text-red-600 fill-current opacity-95 drop-shadow-[0_0_16px_rgba(239,68,68,0.9)]"
                          preserveAspectRatio="none"
                        >
                          <polygon points="0,55 14,35 4,22 28,20 34,0 58,16 78,2 94,22 128,6 142,28 178,0 184,24 218,6 226,28 258,8 262,30 298,22 282,50 300,60 280,75 296,92 264,84 254,106 224,86 214,106 178,86 168,108 134,84 118,106 84,86 68,106 44,84 24,100 20,74 0,72 12,62" />
                        </svg>
                      </div>

                      {/* Przycisk Ultra Cwaniak */}
                      <button
                        type="button"
                        onClick={handleSelectUltraCwaniak}
                        id="btn-cwaniak-ekstra"
                        className="relative w-full py-4 sm:py-5 px-3 sm:px-6 rounded-2xl border-[3.5px] border-slate-900 bg-gradient-to-br from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-orange-600 text-white font-black shadow-[6px_6px_0px_#7f1d1d,9px_9px_0px_#0f172a] hover:shadow-[8px_8px_0px_#7f1d1d,12px_12px_0px_#0f172a] hover:scale-[1.03] active:scale-95 transition-all duration-150 flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden"
                      >
                        {/* Górne okienko: Achtung, Achtung! */}
                        <span className="inline-flex items-center gap-1.5 bg-amber-300 text-slate-950 text-[11px] sm:text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] -rotate-2 group-hover:rotate-0 transition-transform">
                          <span className="animate-spin">💥</span>
                          <span>Achtung, Achtung!</span>
                          <span className="animate-spin">💥</span>
                        </span>

                        {/* Główny tytuł: ULTRA CWANIAK */}
                        <div className="flex items-center justify-center gap-2 sm:gap-3 text-2xl sm:text-4xl tracking-wider font-extrabold uppercase text-yellow-200 drop-shadow-[2px_2px_0px_#000000]">
                          <span className="animate-bounce">💣</span>
                          <span>ULTRA CWANIAK</span>
                          <span className="animate-bounce">💥</span>
                        </div>

                        {/* Pasek ostrzegawczy z wybuchem */}
                        <div className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-300 border-2 border-slate-900 text-slate-950 shadow-[2px_2px_0px_#0f172a] transform -rotate-1 group-hover:rotate-0 transition-transform">
                          <span className="text-sm sm:text-base">💥</span>
                          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-center">
                            UWAGA! NIE KLIKAJ TUTAJ, TYLKO DLA PRAWDZIWYCH CWANIAKÓW
                          </span>
                          <span className="text-sm sm:text-base">🔥</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic feedback based on choice */}
                  {errorMessage && (
                    <div className="rounded-xl border-2 border-slate-900 bg-amber-100/90 p-2.5 sm:p-4 text-center space-y-1 animate-in shake duration-200">
                      <p className="text-xs sm:text-lg font-extrabold uppercase text-slate-950">
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  {level === 'tak' && !errorMessage && (
                    <div className="rounded-xl border-2 border-slate-900 bg-amber-50 p-2.5 sm:p-4 text-center space-y-1 animate-in fade-in duration-150">
                      <p className="text-xs sm:text-lg font-extrabold text-slate-900 uppercase">
                        Świetnie! Prawdziwy cwaniak. Możesz przejść dalej!
                      </p>
                    </div>
                  )}
                </div>
              </ChalkboardFrame>

              <div className="flex justify-end -mt-5 sm:-mt-6 pr-3 sm:pr-4 relative z-20 pointer-events-none">
                <WimpyCharacters pose="looking_up" className="scale-75 sm:scale-100 origin-bottom-right" />
              </div>
            </div>

            {/* Action Button */}
            <div className="sketch-box p-3 sm:p-5 bg-white text-center space-y-1.5 sm:space-y-3">
              {level === 'tak' ? (
                <button
                  type="button"
                  onClick={handleProceedStep2}
                  className="w-full sketch-btn-black py-3 sm:p-4 text-base sm:text-xl font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#0f172a] sm:shadow-[5px_5px_0px_#0f172a] animate-in zoom-in-95 duration-150"
                >
                  <span>Zatwierdź i przejdź dalej</span>
                  <span aria-hidden="true">→</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleProceedStep2}
                  className="w-full sketch-btn py-3 sm:p-4 text-sm sm:text-lg font-extrabold text-slate-500 bg-slate-100 border-2 border-slate-400 cursor-not-allowed"
                >
                  <span>
                    {level === 'nie'
                      ? '„NIE” nie przejdzie! Zmień na TAK →'
                      : level === 'moze'
                      ? 'Więcej wiary w siebie – kliknij TAK →'
                      : 'Wybierz TAK lub ULTRA CWANIAK, aby przejść dalej'}
                  </span>
                </button>
              )}

              <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">
                Tylko pewny siebie cwaniak może podjąć to wyzwanie
              </p>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            KROK 3: PODPUCHA! "Gratulacje, odbierz 50 tokenów. Gratis." DLA CWANIAKA
            ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="space-y-5 sm:space-y-8 animate-in zoom-in-95 duration-200">
            {/* Main Notebook Comic Splash Container (100% Black & White) */}
            <div className="relative rounded-3xl border-[4.5px] border-slate-900 bg-white p-6 sm:p-12 shadow-[12px_12px_0px_#0f172a] space-y-6 sm:space-y-8 text-center">
              
              {/* Header Podpucha Banner */}
              <div className="inline-block px-5 sm:px-8 py-2 rounded-xl border-[3px] border-slate-900 bg-white text-slate-900 font-black text-xl sm:text-3xl shadow-[4px_4px_0px_#0f172a] uppercase tracking-wider -rotate-1">
                💥 PODPUCHA! KROK 3 Z 3 💥
              </div>

              {/* Hand-drawn character celebrating */}
              <div className="flex justify-center my-2">
                <div className="p-3 sm:p-5 rounded-2xl border-[3px] border-dashed border-slate-900 bg-slate-50 shadow-[4px_4px_0px_#0f172a]">
                  <WimpyCharacters pose="happy" className="scale-125 sm:scale-150 my-1" />
                </div>
              </div>

              {/* Big Comic Bubble */}
              <div className="p-5 sm:p-8 rounded-2xl border-[4px] border-slate-900 bg-white shadow-[6px_6px_0px_#0f172a] space-y-2 text-center">
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-500">
                  Dla cwaniaka
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                  Gratulacje, odbierz 50 tokenów. Gratis.
                </h2>
                <p className="text-xs sm:text-base font-bold text-slate-600">
                  Wciśnij przycisk poniżej, aby odebrać 50 darmowych tokenów.
                </p>
              </div>

              {/* Feedback banner on toggle */}
              {toggleFeedback && (
                <div
                  className={`p-3 sm:p-4 rounded-xl border-[3px] border-slate-900 font-black text-sm sm:text-lg animate-in shake duration-200 shadow-[4px_4px_0px_#0f172a] ${
                    isPressed
                      ? 'bg-slate-100 text-slate-900'
                      : 'bg-white text-slate-900 border-dashed'
                  }`}
                >
                  {toggleFeedback}
                </div>
              )}

              {/* 🔘 THE "ODBIERZ" BUTTON (WCIŚNIJ = +50, ODCIŚNIJ = -51) */}
              <div className="pt-2 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={handleToggleOdbierz}
                  disabled={isProcessingToken}
                  id="btn-odbierz-tokeny"
                  className={`w-full py-4 sm:py-6 px-6 sm:px-8 rounded-2xl border-[4px] border-slate-900 font-black text-xl sm:text-3xl tracking-wide uppercase transition-all duration-150 cursor-pointer flex flex-col items-center justify-center gap-1 select-none ${
                    isPressed
                      ? 'bg-slate-900 text-white shadow-none translate-y-2'
                      : 'bg-white text-slate-900 shadow-[8px_8px_0px_#0f172a] hover:shadow-[10px_10px_0px_#0f172a] hover:scale-[1.02] active:translate-y-2 active:shadow-none'
                  }`}
                >
                  <span>
                    {isProcessingToken
                      ? 'ŁADOWANIE...'
                      : isPressed
                      ? '✓ PRZYCISK WCIŚNIĘTY (ODBIERZ)'
                      : 'WCIŚNIJ PRZYCISK: ODBIERZ'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold opacity-80 lowercase">
                    {isPressed ? '(kliknij ponownie, aby odcisnąć: -51 tokenów)' : '(wciśnij, aby otrzymać +50 tokenów gratis)'}
                  </span>
                </button>
              </div>

              {/* Po wciśnięciu tego przycisku prowadź do zadań */}
              {isPressed && (
                <div className="pt-4 animate-in zoom-in-95 duration-150 space-y-2">
                  <button
                    type="button"
                    onClick={handleProceedToTasks}
                    id="btn-przejdz-do-zadan"
                    className="w-full sketch-btn-black py-4 sm:py-5 px-8 text-xl sm:text-2xl font-black flex items-center justify-center gap-3 cursor-pointer shadow-[6px_6px_0px_#0f172a] hover:scale-102 active:scale-98 transition-transform"
                  >
                    <span>Przejdź do zadań</span>
                    <span aria-hidden="true">→</span>
                  </button>
                  <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Tokeny zostały przyznane! Ruszaj do nauki, cwaniaczku.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
