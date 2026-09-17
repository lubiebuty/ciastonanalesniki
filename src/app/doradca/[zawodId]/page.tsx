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
    <main className="min-h-screen p-2.5 sm:p-6 md:p-10 font-sketch flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-10 animate-in fade-in duration-300">
        
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
