'use client';

import React, { useState } from 'react';
import { Zawod } from '@/lib/doradca';
import { sprawdzLamiglowke } from '@/lib/doradca-mechanics';

interface Props {
  zawod: Zawod;
  onFinish: (wynik: { poprawnych: number; wszystkich: number; zaliczony: boolean }) => void;
}

export default function LamiglowkaScenariusz({ zawod, onFinish }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const lamiglowki = zawod.lamiglowki || [];

  if (lamiglowki.length === 0) return null;

  const current = lamiglowki[currentIdx];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const poprawnie = sprawdzLamiglowke(inputValue, current.odpowiedz);

    if (poprawnie) {
      setErrorMsg(null);
      setInputValue('');
      if (currentIdx < lamiglowki.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        onFinish({
          poprawnych: lamiglowki.length,
          wszystkich: lamiglowki.length,
          zaliczony: true
        });
      }
    } else {
      setErrorMsg('Błędna odpowiedź, spróbuj ponownie!');
    }
  };

  return (
    <div className="sketch-box bg-white p-6 md:p-10 space-y-6 max-w-2xl mx-auto text-center">
      <div className="flex items-center justify-center gap-3 border-b-2 border-dashed border-slate-300 pb-4">
        <span className="text-4xl">{zawod.ikonaEmoji}</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900">{zawod.nazwa}</h2>
      </div>

      <div className="space-y-6 animate-in slide-in-from-right duration-300 pt-2">
        <div className="text-sm font-extrabold text-slate-500 uppercase tracking-widest">
          Zagadka {currentIdx + 1} z {lamiglowki.length}
        </div>
        
        <h3 className="text-xl font-extrabold text-slate-900 leading-relaxed text-left p-4 bg-amber-50 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
          {current.tresc}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setErrorMsg(null);
            }}
            placeholder="Wpisz odpowiedź..."
            className="w-full p-4 rounded-xl border-2 border-slate-900 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-extrabold text-lg text-center uppercase tracking-wider shadow-[3px_3px_0px_#0f172a]"
          />
          
          {errorMsg && (
            <p className="text-rose-600 font-bold animate-in shake">{errorMsg}</p>
          )}

          <button 
            type="submit" 
            disabled={!inputValue.trim()}
            className="sketch-btn-black px-6 py-3 font-extrabold text-lg w-full disabled:opacity-50"
          >
            Sprawdź odpowiedź
          </button>
        </form>
      </div>
    </div>
  );
}
