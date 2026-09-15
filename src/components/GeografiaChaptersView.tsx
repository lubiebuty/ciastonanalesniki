'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Topic } from '@/lib/topics';
import {
  computeAllDzialyProgress,
  WARIANTY_METADATA,
  isQuestionPassed,
  type UserSessionMinimal,
  type DzialProgress,
} from '@/lib/geografia';

interface GeografiaChaptersViewProps {
  topics: Topic[];
  userSessions: UserSessionMinimal[];
  onSelectTopic: (topicId: string) => void;
  creating?: boolean;
  compact?: boolean;
  initialExpandedDzial?: number | null;
}

export default function GeografiaChaptersView({
  topics,
  userSessions,
  onSelectTopic,
  creating = false,
  compact = false,
  initialExpandedDzial = null,
}: GeografiaChaptersViewProps) {
  const [expandedDzial, setExpandedDzial] = useState<number | null>(initialExpandedDzial ?? (compact ? null : 1));

  const dzialyProgress: DzialProgress[] = computeAllDzialyProgress(topics, userSessions);

  const toggleExpand = (numer: number) => {
    if (compact) return;
    setExpandedDzial((prev) => (prev === numer ? null : numer));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {dzialyProgress.map((dzial) => {
          const isExpanded = !compact && expandedDzial === dzial.numer;
          const dzialTopics = topics.filter((t) => t.dzial_numer === dzial.numer);

          return (
            <div
              key={dzial.numer}
              className={`rounded-xl border-[2.5px] border-slate-900 transition-all ${
                dzial.isCompleted
                  ? 'bg-emerald-50/70 shadow-[4px_4px_0px_#0f172a]'
                  : dzial.isUnlocked
                  ? 'bg-white shadow-[4px_4px_0px_#0f172a]'
                  : 'bg-slate-100/80 opacity-85 shadow-[2px_2px_0px_#0f172a]'
              }`}
            >
              {/* Header row of Dział */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg border-2 border-slate-900 bg-amber-200 text-slate-900 font-extrabold text-sm shadow-[1.5px_1.5px_0px_#0f172a]">
                      {dzial.rzymski}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-wide">
                        Dział {dzial.rzymski}: {dzial.nazwa}
                      </h3>
                      <p className="text-xs sm:text-sm font-bold text-slate-600">
                        {dzial.opis}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {dzial.isCompleted ? (
                      <span className="px-2.5 py-1 rounded-md border-2 border-slate-900 bg-emerald-200 text-slate-900 font-extrabold text-xs tracking-wider uppercase shadow-[1.5px_1.5px_0px_#0f172a]">
                        Ukończony (100%)
                      </span>
                    ) : dzial.isUnlocked ? (
                      <span className="px-2.5 py-1 rounded-md border-2 border-slate-900 bg-amber-200 text-slate-900 font-extrabold text-xs tracking-wider uppercase shadow-[1.5px_1.5px_0px_#0f172a]">
                        W trakcie ({dzial.percentage}%)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md border-2 border-slate-900 bg-slate-200 text-slate-700 font-extrabold text-xs tracking-wider uppercase shadow-[1.5px_1.5px_0px_#0f172a]">
                        Zablokowany
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-slate-700">
                    <span>Postęp działu: {dzial.passedQuestions} / {dzial.totalQuestions} pytań</span>
                    <span>{dzial.percentage}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full border-2 border-slate-900 bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${dzial.percentage}%` }}
                    />
                  </div>
                </div>

                {/* 4 Variant summary badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {(['A', 'B', 'C', 'D'] as const).map((vCode) => {
                    const vProg = dzial.variants[vCode];
                    const vMeta = WARIANTY_METADATA[vCode];

                    let badgeBg = 'bg-slate-100 text-slate-500 border-slate-400';
                    let badgeLabel = 'Zablokowany';

                    if (vProg.isCompleted) {
                      badgeBg = 'bg-emerald-100 text-emerald-950 border-slate-900';
                      badgeLabel = `${vProg.passed}/${vProg.total} zdane`;
                    } else if (vProg.isUnlocked) {
                      badgeBg = 'bg-amber-100 text-slate-900 border-slate-900';
                      badgeLabel = `${vProg.passed}/${vProg.total} w trakcie`;
                    }

                    return (
                      <div
                        key={vCode}
                        className={`p-2 rounded-lg border-2 text-left space-y-0.5 shadow-[1.5px_1.5px_0px_#0f172a] ${badgeBg}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs tracking-wide">
                            Wariant {vCode}
                          </span>
                          {!vProg.isUnlocked && (
                            <svg className="w-3.5 h-3.5 stroke-slate-500 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                          )}
                        </div>
                        <p className="text-[11px] font-bold truncate">
                          {vProg.isUnlocked ? badgeLabel : 'Wymaga wariantu poprz.'}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Footer action of chapter card */}
                <div className="pt-2 flex items-center justify-between border-t border-dashed border-slate-300">
                  <span className="text-xs font-bold text-slate-500">
                    {compact
                      ? (dzial.isUnlocked ? 'Warianty A → B → C → D' : `Wymaga zaliczenia Działu ${dzial.numer - 1}`)
                      : 'Kolejność: Wariant A → B → C → D'}
                  </span>

                  {compact ? (
                    dzial.isUnlocked ? (
                      <Link
                        href="/topics?przedmiot=geografia"
                        className="sketch-btn px-3.5 py-1.5 text-xs sm:text-sm font-extrabold cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>Przejdź do zadań</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">
                        Zablokowany
                      </span>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleExpand(dzial.numer)}
                      className="sketch-btn px-3.5 py-1.5 text-xs sm:text-sm font-extrabold cursor-pointer"
                    >
                      {isExpanded ? 'Zwiń zadania ↑' : 'Rozwiń zadania (A, B, C, D) ↓'}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded details: Variants A, B, C, D question list - ONLY in full mode */}
              {!compact && isExpanded && (
                <div className="border-t-[2.5px] border-slate-900 bg-amber-50/30 p-4 sm:p-5 space-y-6">
                  {!dzial.isUnlocked && (
                    <div className="p-3 rounded-lg border-2 border-dashed border-slate-400 bg-slate-100 text-slate-700 text-sm font-bold">
                      Ten dział jest zablokowany. Aby go odblokować, zalicz wszystkie warianty (A, B, C, D) w Dziale {dzial.numer - 1}.
                    </div>
                  )}

                  {(['A', 'B', 'C', 'D'] as const).map((vCode) => {
                    const vProg = dzial.variants[vCode];
                    const vMeta = WARIANTY_METADATA[vCode];
                    const vTopics = dzialTopics.filter((t) => t.wariant === vCode);

                    return (
                      <div
                        key={vCode}
                        className={`p-4 rounded-xl border-2 border-slate-900 space-y-3 ${
                          vProg.isCompleted
                            ? 'bg-emerald-50/80 shadow-[2px_2px_0px_#0f172a]'
                            : vProg.isUnlocked
                            ? 'bg-white shadow-[2px_2px_0px_#0f172a]'
                            : 'bg-slate-100/90 border-dashed opacity-80'
                        }`}
                      >
                        {/* Variant header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-dashed border-slate-300 pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded border border-slate-900 bg-amber-200 font-extrabold text-xs">
                                Wariant {vCode}
                              </span>
                              <h4 className="font-extrabold text-base text-slate-900">
                                {vMeta.nazwa}
                              </h4>
                            </div>
                            <p className="text-xs font-bold text-slate-600 mt-1">
                              {vMeta.opis}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {vProg.isCompleted ? (
                              <span className="px-2 py-0.5 rounded border border-emerald-900 bg-emerald-200 text-emerald-950 font-extrabold text-xs">
                                Ukończony ({vProg.passed}/{vProg.total})
                              </span>
                            ) : vProg.isUnlocked ? (
                              <span className="px-2 py-0.5 rounded border border-amber-900 bg-amber-200 text-amber-950 font-extrabold text-xs">
                                Odblokowany ({vProg.passed}/{vProg.total})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded border border-slate-400 bg-slate-200 text-slate-600 font-extrabold text-xs flex items-center gap-1">
                                <svg className="w-3 h-3 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                Zablokowany
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Questions list */}
                        <div className="space-y-2.5">
                          {vTopics.map((topic, qIdx) => {
                            const passed = isQuestionPassed(topic, userSessions);
                            const canAttempt = vProg.isUnlocked;

                            return (
                              <div
                                key={topic.id}
                                className={`p-3 sm:p-3.5 rounded-lg border-[2px] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                  passed
                                    ? 'border-emerald-700 bg-emerald-50/50'
                                    : canAttempt
                                    ? 'border-slate-900 bg-white hover:bg-amber-50/60 shadow-[2px_2px_0px_#0f172a]'
                                    : 'border-slate-300 bg-slate-50 text-slate-500'
                                }`}
                              >
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-1.5 py-0.5 rounded border border-slate-900 bg-slate-100 text-[11px] font-extrabold text-slate-800">
                                      Pytanie {qIdx + 1} ({topic.id_slug || `Zadanie ${topic.numer}`})
                                    </span>
                                    {topic.notatka && (
                                      <span className="px-1.5 py-0.5 rounded border border-amber-800 bg-amber-100 text-[10px] font-extrabold text-amber-950">
                                        Uwaga: {topic.notatka.slice(0, 45)}...
                                      </span>
                                    )}
                                    {passed && (
                                      <span className="px-1.5 py-0.5 rounded border border-emerald-800 bg-emerald-200 text-[11px] font-extrabold text-emerald-950">
                                        Zaliczone
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                                    {topic.pytanie}
                                  </p>
                                </div>

                                <div className="self-end sm:self-center">
                                  {canAttempt ? (
                                    <button
                                      type="button"
                                      onClick={() => onSelectTopic(topic.id)}
                                      disabled={creating}
                                      className={`px-3 py-1.5 text-xs sm:text-sm font-extrabold rounded-lg border-2 border-slate-900 transition-all cursor-pointer ${
                                        passed
                                          ? 'bg-white hover:bg-slate-100 text-slate-800 shadow-[1.5px_1.5px_0px_#0f172a]'
                                          : 'sketch-btn-black'
                                      }`}
                                    >
                                      {passed ? 'Powtórz zadanie' : 'Rozpocznij →'}
                                    </button>
                                  ) : (
                                    <span className="text-xs font-bold text-slate-400 italic">
                                      Zablokowane
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
