'use client';

import React from 'react';

/**
 * Top banner displayed when a user has 0 tokens remaining.
 * Informs the user to contact ciastonanalesniki@gmail.com for token increase and extended access,
 * while noting they can still browse all tasks and view their past results.
 */
export default function NoTokensBanner() {
  return (
    <div
      role="region"
      aria-label="Informacja o braku tokenów"
      className="rounded-xl border-[2.5px] border-slate-900 bg-amber-50/90 p-3 sm:p-4 shadow-[4px_4px_0px_#0f172a] font-sketch select-none animate-in fade-in duration-150 mb-4 sm:mb-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-slate-900 bg-amber-200 text-slate-900 text-xs font-extrabold shadow-[1px_1px_0px_#0f172a]">
              Limit tokenów wyczerpany
            </span>
            <span className="text-xs font-bold text-slate-500">
              0 tokenów na koncie
            </span>
          </div>
          <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
            Aby uruchamiać kolejne zadania i otrzymywać analizy AI, skontaktuj się z nami o zwiększenie liczby tokenów i przedłużenie dostępu.
          </p>
          <p className="text-xs font-bold text-slate-600">
            Możesz nadal przeglądać wszystkie zadania oraz sprawdzać swoje wyniki w zakładce &quot;Moje wyniki&quot;.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <a
            href="mailto:ciastonanalesniki@gmail.com?subject=Pro%C5%9Bba%20o%20zwi%C4%99kszenie%20liczby%20token%C3%B3w%20i%20przed%C5%82u%C5%BCenie%20dost%C4%99pu"
            className="sketch-btn-black py-2 px-3.5 text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-[2px_2px_0px_#0f172a]"
          >
            <span>Napisz: ciastonanalesniki@gmail.com</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
}
