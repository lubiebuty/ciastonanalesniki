'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ZAWODY } from '@/lib/doradca';

import QuizWymagan from '@/components/doradca/QuizWymagan';
import TimerReakcja from '@/components/doradca/TimerReakcja';
import LamiglowkaScenariusz from '@/components/doradca/LamiglowkaScenariusz';
import ZadanieObliczeniowe from '@/components/doradca/ZadanieObliczeniowe';
import AnimacjaBezPytan from '@/components/doradca/AnimacjaBezPytan';

export default function ZawodPage() {
  const router = useRouter();
  const params = useParams();
  const zawodId = typeof params?.zawodId === 'string' ? params.zawodId : '';
  const zawod = ZAWODY.find(z => z.id === zawodId);
  const [finished, setFinished] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  if (!zawod) {
    return (
      <main className="min-h-screen p-6 font-sketch flex flex-col items-center justify-center">
        <h1 className="text-3xl font-extrabold text-slate-900">Nie znaleziono takiego zawodu</h1>
        <Link href="/doradca" className="mt-4 sketch-btn px-4 py-2">Powrót</Link>
      </main>
    );
  }

  const handleFinish = (wynik: { poprawnych: number; wszystkich: number; zaliczony: boolean }) => {
    setFinished(true);
    if (wynik.zaliczony) {
      setResultMsg(`Świetnie! Wynik: ${wynik.poprawnych}/${wynik.wszystkich}. Masz predyspozycje!`);
    } else {
      setResultMsg(`Niestety... Wynik: ${wynik.poprawnych}/${wynik.wszystkich}. Spróbuj czegoś innego.`);
    }
  };

  return (
    <main className="relative z-0 min-h-screen p-2.5 sm:p-6 md:p-10 font-sketch flex flex-col justify-between overflow-hidden">
      {/* Tło graficzne bazowe */}
      <div 
        className="fixed inset-0 pointer-events-none z-[-2] bg-[#0a0a0a] bg-center bg-cover bg-no-repeat bg-fixed opacity-95"
        style={{ backgroundImage: "url('/images/doradca_bg.jpg')" }}
      />
      {/* Pełny układ reklamowy z doradcy jako tło */}
      <div className="fixed inset-0 pointer-events-none z-[-1] flex flex-col items-center justify-start opacity-100 overflow-hidden">
        <div className="relative flex flex-col items-center justify-center py-16 sm:py-20 w-full max-w-4xl mx-auto">
          <img src="/images/item2.png" alt="Ad" className="absolute w-[40%] sm:w-[35%] -rotate-12 top-[-10%] left-[-20%] sm:left-[-15%] z-0 drop-shadow-xl" />
          <img src="/images/item1.png" alt="Ad" className="absolute w-[45%] sm:w-[40%] rotate-6 top-[-15%] right-[-15%] z-0 drop-shadow-xl" />
          <img src="/images/item4.png" alt="Ad" className="absolute w-[55%] sm:w-[50%] top-[5%] left-[10%] z-0 drop-shadow-xl" />
          <img src="/images/item3.png" alt="Ad" className="absolute w-[45%] sm:w-[40%] rotate-12 bottom-[0%] right-[-25%] sm:right-[-15%] z-0 drop-shadow-xl" />
          
          <img src="/images/item2.png" alt="Ad" className="absolute w-[35%] sm:w-[30%] rotate-[20deg] bottom-[-15%] left-[-15%] z-0 drop-shadow-xl" />
          <img src="/images/item1.png" alt="Ad" className="absolute w-[40%] sm:w-[35%] -rotate-[15deg] top-[30%] left-[-25%] z-0 drop-shadow-xl" />
          <img src="/images/item3.png" alt="Ad" className="absolute w-[35%] sm:w-[30%] -rotate-[30deg] top-[20%] right-[15%] z-0 drop-shadow-xl" />
          <img src="/images/item4.png" alt="Ad" className="absolute w-[40%] sm:w-[35%] rotate-3 bottom-[25%] left-[30%] z-0 drop-shadow-xl" />

          <img src="/images/item3.png" alt="Ad" className="absolute w-[30%] sm:w-[25%] rotate-[45deg] top-[-5%] left-[35%] z-0 drop-shadow-xl" />
          <img src="/images/item2.png" alt="Ad" className="absolute w-[35%] sm:w-[30%] -rotate-[40deg] top-[50%] right-[0%] z-0 drop-shadow-xl" />
          <img src="/images/item1.png" alt="Ad" className="absolute w-[45%] sm:w-[40%] rotate-[10deg] bottom-[-20%] left-[10%] z-0 drop-shadow-xl" />
          <img src="/images/item4.png" alt="Ad" className="absolute w-[50%] sm:w-[45%] -rotate-6 bottom-[-10%] right-[10%] z-0 drop-shadow-xl" />
          <img src="/images/item2.png" alt="Ad" className="absolute w-[40%] sm:w-[35%] rotate-[25deg] top-[15%] left-[60%] z-0 drop-shadow-xl" />
          <img src="/images/item1.png" alt="Ad" className="absolute w-[30%] sm:w-[25%] -rotate-[20deg] bottom-[40%] left-[-5%] z-0 drop-shadow-xl" />
          <img src="/images/item3.png" alt="Ad" className="absolute w-[40%] sm:w-[35%] rotate-[5deg] top-[75%] right-[-20%] z-0 drop-shadow-xl" />
          <img src="/images/item4.png" alt="Ad" className="absolute w-[35%] sm:w-[30%] -rotate-[8deg] top-[60%] left-[-30%] z-0 drop-shadow-xl" />

          <img src="/images/dice_header_transparent.png" alt="DICE DORADCA ZAWODOWY DICE" className="relative z-10 w-full max-w-xl sm:max-w-3xl mx-auto rotate-1" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-10 animate-in fade-in duration-300 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/doradca"
            className="sketch-btn px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-extrabold text-slate-900"
          >
            ← Inne zawody
          </Link>
          <span className="text-xs sm:text-sm font-extrabold uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md border-2 border-slate-900 bg-amber-100 shadow-[2px_2px_0px_#0f172a]">
            {zawod.nazwa}
          </span>
        </div>

        {/* Content */}
        {!finished ? (
          <div className="py-4">
            {zawod.mechanika === 'quiz_wymagan' && <QuizWymagan zawod={zawod} onFinish={handleFinish} />}
            {zawod.mechanika === 'timer_reakcja' && <TimerReakcja zawod={zawod} onFinish={handleFinish} />}
            {zawod.mechanika === 'lamiglowka' && <LamiglowkaScenariusz zawod={zawod} onFinish={handleFinish} />}
            {zawod.mechanika === 'zadanie_obliczeniowe' && <ZadanieObliczeniowe zawod={zawod} onFinish={handleFinish} />}
            {zawod.mechanika === 'animacja_bez_pytan' && <AnimacjaBezPytan zawod={zawod} onFinish={handleFinish} />}
          </div>
        ) : (
          <div className="sketch-box bg-white p-6 md:p-10 space-y-6 max-w-2xl mx-auto text-center animate-in zoom-in-95">
            <h2 className="text-3xl font-extrabold uppercase text-slate-900">Podsumowanie</h2>
            <p className="text-xl font-bold text-slate-700 p-6 bg-slate-50 border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_#0f172a]">
              {resultMsg}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setFinished(false)}
                className="sketch-btn-black px-6 py-3 font-extrabold text-lg"
              >
                Spróbuj ponownie
              </button>
              <Link 
                href="/doradca"
                className="sketch-btn px-6 py-3 font-extrabold text-lg"
              >
                Inne Zawody
              </Link>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
