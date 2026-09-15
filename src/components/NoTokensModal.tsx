'use client';

import React from 'react';
import Link from 'next/navigation';

interface NoTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal shown when a user with 0 tokens attempts to start a task or receive an analysis.
 * Directs them to contact ciastonanalesniki@gmail.com for token increase and extended access,
 * while clarifying that they can still browse all questions and view their existing results.
 */
export default function NoTokensModal({ isOpen, onClose }: NoTokensModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="no-tokens-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 font-sketch"
    >
      <div className="w-full max-w-lg rounded-2xl border-[3px] border-slate-900 bg-white p-6 sm:p-7 shadow-[8px_8px_0px_#0f172a] space-y-5 animate-in zoom-in-95 duration-150">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-slate-900 text-xs font-extrabold border border-slate-900 shadow-[1px_1px_0px_#0f172a]">
            Limit tokenów wyczerpany
          </div>
          <h2
            id="no-tokens-title"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 uppercase"
          >
            Brak dostępnych tokenów
          </h2>
          <p className="text-sm font-bold text-slate-600 leading-relaxed">
            Nie posiadasz wolnych tokenów, aby uruchomić to zadanie lub otrzymać analizę odpowiedzi.
          </p>
        </div>

        {/* Contact info card */}
        <div className="rounded-xl border-2 border-slate-900 bg-amber-50/70 p-4 space-y-2 shadow-[3px_3px_0px_#0f172a]">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Jak zwiększyć limit?
          </span>
          <p className="text-base font-bold text-slate-900 leading-relaxed">
            Skontaktuj się z nami mailowo, aby zwiększyć liczbę tokenów i przedłużyć dostęp:
          </p>
          <div className="p-3 rounded-lg border-2 border-slate-900 bg-white shadow-[2px_2px_0px_#0f172a] text-center">
            <a
              href="mailto:ciastonanalesniki@gmail.com?subject=Pro%C5%9Bba%20o%20zwi%C4%99kszenie%20liczby%20token%C3%B3w%20i%20przed%C5%82u%C5%BCenie%20dost%C4%99pu"
              className="text-base sm:text-lg font-extrabold text-slate-900 underline hover:text-amber-700 break-all select-all"
            >
              ciastonanalesniki@gmail.com
            </a>
          </div>
        </div>

        {/* What user can still do */}
        <div className="rounded-xl border-2 border-dashed border-slate-300 p-3.5 text-xs font-bold text-slate-600 space-y-1">
          <p className="font-extrabold text-slate-900 uppercase">
            Co możesz teraz zrobić:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-700">
            <li>Przeglądać wszystkie zadania ze wszystkich przedmiotów.</li>
            <li>Przeglądać swoje dotychczasowe próby i analizy w zakładce &quot;Moje wyniki&quot;.</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="sketch-btn py-2.5 px-4 font-extrabold text-sm sm:w-1/3"
          >
            Wróć
          </button>
          <a
            href="mailto:ciastonanalesniki@gmail.com?subject=Pro%C5%9Bba%20o%20zwi%C4%99kszenie%20liczby%20token%C3%B3w%20i%20przed%C5%82u%C5%BCenie%20dost%C4%99pu"
            className="sketch-btn-black py-2.5 px-4 font-extrabold text-sm flex-1 text-center inline-flex items-center justify-center gap-2"
          >
            <span>Napisz wiadomość</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
}
