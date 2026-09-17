'use client';

import React, { useState } from 'react';
import { Zawod } from '@/lib/doradca';

interface Props {
  zawod: Zawod;
  onFinish: (wynik: { poprawnych: number; wszystkich: number; zaliczony: boolean }) => void;
}

export default function QuizWymagan({ zawod, onFinish }: Props) {
  const [phase, setPhase] = useState<'wymagania' | 'pytania' | 'koniec'>('wymagania');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  const pytania = zawod.pytania || [];

  const handleStart = () => {
    setPhase('pytania');
  };

  const handleAnswer = (index: number) => {
    const isCorrect = index === pytania[currentQuestionIndex].poprawnaOdpowiedz;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    if (currentQuestionIndex < pytania.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setPhase('koniec');
      onFinish({
        poprawnych: newScore,
        wszystkich: pytania.length,
        zaliczony: newScore === pytania.length // Opcjonalnie, uznajemy za zaliczony jak ma max pkt
      });
    }
  };

  return (
    <div className="sketch-box bg-white p-6 md:p-10 space-y-6 max-w-2xl mx-auto text-center">
      <div className="flex items-center justify-center gap-3">
        <span className="text-4xl">{zawod.ikonaEmoji}</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-slate-900">{zawod.nazwa}</h2>
      </div>

      {phase === 'wymagania' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <p className="text-lg font-bold text-slate-700">Oto wymagania na to stanowisko. Gotowy?</p>
          <div className="flex flex-wrap justify-center gap-2">
            {zawod.wymagania?.map((wymaganie, idx) => (
              <span key={idx} className="px-3 py-1.5 border-2 border-slate-900 bg-amber-100 rounded-md font-extrabold text-sm shadow-[2px_2px_0px_#0f172a]">
                {wymaganie}
              </span>
            ))}
          </div>
          <button onClick={handleStart} className="sketch-btn-black px-6 py-3 font-extrabold text-lg mt-4 w-full">
            Rozpocznij Test
          </button>
        </div>
      )}

      {phase === 'pytania' && pytania[currentQuestionIndex] && (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="text-sm font-extrabold text-slate-500 uppercase tracking-widest">
            Pytanie {currentQuestionIndex + 1} z {pytania.length}
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
            {pytania[currentQuestionIndex].tresc}
          </h3>
          <div className="grid grid-cols-1 gap-3 text-left">
            {pytania[currentQuestionIndex].opcje.map((opcja, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-900 bg-white hover:bg-amber-50 shadow-[3px_3px_0px_#0f172a] hover:shadow-[4px_4px_0px_#0f172a] transition-all font-bold text-slate-700 hover:text-slate-900"
              >
                {opcja}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'koniec' && (
        <div className="space-y-4 animate-in zoom-in-95 duration-200">
          <h3 className="text-2xl font-extrabold text-slate-900 uppercase">Koniec testu!</h3>
          <p className="text-lg font-bold text-slate-700">
            Twój wynik: <strong className="text-xl text-slate-900">{score} / {pytania.length}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
