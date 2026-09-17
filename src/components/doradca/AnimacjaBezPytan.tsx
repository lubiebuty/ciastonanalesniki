'use client';

import React, { useState, useEffect } from 'react';
import { Zawod } from '@/lib/doradca';

interface Props {
  zawod: Zawod;
  onFinish: (wynik: { poprawnych: number; wszystkich: number; zaliczony: boolean }) => void;
}

export default function AnimacjaBezPytan({ zawod, onFinish }: Props) {
  const [phase, setPhase] = useState<'intro' | 'action' | 'koniec'>('intro');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === 'action') {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setPhase('koniec');
            return 100;
          }
          return prev + 10;
        });
      }, 300); // 10 kroków po 300ms = 3 sekundy
    }
    return () => clearInterval(interval);
  }, [phase]);

  const handleStart = () => {
    setPhase('action');
  };

  const handleFinish = () => {
    onFinish({ poprawnych: 1, wszystkich: 1, zaliczony: true });
  };

  return (
    <div className="sketch-box bg-white p-6 md:p-10 space-y-6 max-w-2xl mx-auto text-center">
      <div className="flex items-center justify-center gap-3">
        <span className="text-4xl">{zawod.ikonaEmoji}</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900">{zawod.nazwa}</h2>
      </div>

      {phase === 'intro' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <p className="text-lg font-bold text-slate-700">Oto kariera bez zbędnych pytań. Po prostu zacznij pracę!</p>
          <button onClick={handleStart} className="sketch-btn-black px-6 py-3 font-extrabold text-lg mt-4 w-full">
            Zacznij pracować ({zawod.nazwa})
          </button>
        </div>
      )}

      {phase === 'action' && (
        <div className="space-y-6 animate-in zoom-in-95 duration-200 py-6">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-wider animate-pulse">
            Trwa praca...
          </h3>
          
          <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden border-2 border-slate-900 relative">
            <div 
              className="bg-amber-400 h-full transition-all duration-300 ease-linear flex items-center justify-end px-2"
              style={{ width: `${progress}%` }}
            >
              <span className="text-xs font-black">{progress}%</span>
            </div>
          </div>
          <div className="text-6xl animate-bounce pt-4">
            {zawod.ikonaEmoji}
          </div>
        </div>
      )}

      {phase === 'koniec' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <h3 className="text-3xl font-extrabold text-slate-900 uppercase">Gratulacje!</h3>
          <p className="text-lg font-bold text-slate-700">Rów gotowy! Gratulacje, zarobiłeś... satysfakcję.</p>
          <button onClick={handleFinish} className="sketch-btn-black px-6 py-3 font-extrabold text-lg w-full">
            Zakończ
          </button>
        </div>
      )}
    </div>
  );
}
