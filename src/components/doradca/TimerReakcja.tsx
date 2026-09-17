'use client';

import React, { useState, useEffect } from 'react';
import { Zawod } from '@/lib/doradca';

interface Props {
  zawod: Zawod;
  onFinish: (wynik: { poprawnych: number; wszystkich: number; zaliczony: boolean }) => void;
}

export default function TimerReakcja({ zawod, onFinish }: Props) {
  const [phase, setPhase] = useState<'intro' | 'action' | 'success' | 'fail'>('intro');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const scena = zawod.scenariuszTimer;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === 'action') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            clearInterval(timer);
            setPhase('fail');
            return 0;
          }
          return prev - 100;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [phase]);

  if (!scena) return null;

  const handleStart = () => {
    setTimeLeft(scena.limitSekund * 1000);
    setPhase('action');
  };

  const handleAction = () => {
    setPhase('success');
  };

  const handleFinish = (zaliczony: boolean) => {
    onFinish({ poprawnych: zaliczony ? 1 : 0, wszystkich: 1, zaliczony });
  };

  return (
    <div className="sketch-box bg-white p-6 md:p-10 space-y-6 max-w-2xl mx-auto text-center">
      <div className="flex items-center justify-center gap-3">
        <span className="text-4xl">{zawod.ikonaEmoji}</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900">{zawod.nazwa}</h2>
      </div>

      {phase === 'intro' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <p className="text-lg font-bold text-slate-700">Masz tylko {scena.limitSekund} sekundy na reakcję!</p>
          <button onClick={handleStart} className="sketch-btn-black px-6 py-3 font-extrabold text-lg mt-4 w-full">
            Zaczynamy!
          </button>
        </div>
      )}

      {phase === 'action' && (
        <div className="space-y-6 animate-in zoom-in-95 duration-200">
          <h3 className="text-2xl font-black text-rose-600 uppercase tracking-wider animate-pulse">
            {scena.tresc}
          </h3>
          
          <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden border-2 border-slate-900">
            <div 
              className="bg-rose-500 h-full transition-all duration-100 ease-linear"
              style={{ width: `${Math.max(0, (timeLeft / (scena.limitSekund * 1000)) * 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-4">
            {scena.opcje.map((opcja, idx) => (
              <button
                key={idx}
                onClick={handleAction}
                className="w-full p-4 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 shadow-[3px_3px_0px_#0f172a] hover:shadow-[4px_4px_0px_#0f172a] transition-all font-bold text-slate-700 hover:text-slate-900 text-center uppercase tracking-wide active:translate-y-1 active:shadow-none"
              >
                {opcja}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'success' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <h3 className="text-3xl font-extrabold text-emerald-600 uppercase">Udało się!</h3>
          <p className="text-lg font-bold text-slate-700">Twoja reakcja była wystarczająco szybka.</p>
          <button onClick={() => handleFinish(true)} className="sketch-btn-black px-6 py-3 font-extrabold text-lg w-full">
            Zakończ i wróć
          </button>
        </div>
      )}

      {phase === 'fail' && (
        <div className="space-y-6 animate-in shake duration-300">
          <h3 className="text-3xl font-black text-rose-700 uppercase">{scena.animacjaPorazki}</h3>
          <p className="text-lg font-bold text-slate-700">Kariera w tym zawodzie może być dla Ciebie za szybka!</p>
          <button onClick={() => handleFinish(false)} className="sketch-btn px-6 py-3 font-extrabold text-lg w-full">
            Wybierz inną drogę (Zakończ)
          </button>
        </div>
      )}
    </div>
  );
}
