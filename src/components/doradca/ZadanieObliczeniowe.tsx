'use client';

import React, { useState, useEffect } from 'react';
import { Zawod } from '@/lib/doradca';
import { losujZadanieObliczeniowe, sprawdzZadanieObliczeniowe, WylosowaneZadanieObliczeniowe } from '@/lib/doradca-mechanics';

interface Props {
  zawod: Zawod;
  onFinish: (wynik: { poprawnych: number; wszystkich: number; zaliczony: boolean }) => void;
}

export default function ZadanieObliczenioweComponent({ zawod, onFinish }: Props) {
  const cfg = zawod.zadanieObliczeniowe;
  const [zadanie, setZadanie] = useState<WylosowaneZadanieObliczeniowe | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (cfg) {
      setZadanie(losujZadanieObliczeniowe(cfg.szablonTresci, cfg.zakresyLosowania, cfg.wzorNaWynik));
    }
  }, [cfg]);

  if (!cfg || !zadanie) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputValue.replace(',', '.'));
    if (isNaN(val)) {
      setErrorMsg('Podaj poprawną liczbę!');
      return;
    }

    const poprawnie = sprawdzZadanieObliczeniowe(val, zadanie.poprawnyWynik);
    if (poprawnie) {
      onFinish({ poprawnych: 1, wszystkich: 1, zaliczony: true });
    } else {
      setErrorMsg('Błędny wynik! Spróbuj policzyć jeszcze raz.');
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
          Zadanie obliczeniowe
        </div>
        
        <h3 className="text-xl font-extrabold text-slate-900 leading-relaxed text-left p-4 bg-emerald-50 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
          {zadanie.tresc}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <input
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setErrorMsg(null);
            }}
            placeholder="Wpisz liczbę..."
            className="w-full p-4 rounded-xl border-2 border-slate-900 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-extrabold text-2xl text-center shadow-[3px_3px_0px_#0f172a]"
          />
          
          {errorMsg && (
            <p className="text-rose-600 font-bold animate-in shake">{errorMsg}</p>
          )}

          <button 
            type="submit" 
            disabled={!inputValue.trim()}
            className="sketch-btn-black px-6 py-3 font-extrabold text-lg w-full disabled:opacity-50"
          >
            Sprawdź wynik
          </button>
        </form>
      </div>
    </div>
  );
}
