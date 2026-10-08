'use client';

import { useState } from 'react';
import type { Topic } from '@/lib/topics';
import {
  computeAllDzialyProgress,
  isQuestionPassed,
  WARIANTY_METADATA,
  type DzialProgress,
} from '@/lib/fizyka';
import type { UserSessionMinimal } from '@/lib/geografia';

interface FizykaChaptersViewProps {
  topics: Topic[];
  userSessions: UserSessionMinimal[];
  onSelectTopic: (topicId: string) => void;
  creating?: boolean;
  compact?: boolean;
  initialExpandedDzial?: number | null;
}

export default function FizykaChaptersView({
  topics,
  userSessions,
  onSelectTopic,
  creating = false,
  compact = false,
  initialExpandedDzial,
}: FizykaChaptersViewProps) {
  const dzialyProgress: DzialProgress[] = computeAllDzialyProgress(topics, userSessions);
  const [expandedDzial, setExpandedDzial] = useState<number | null>(initialExpandedDzial || null);

  const handleDzialClick = (dzial: DzialProgress) => {
    if (!dzial.isUnlocked || creating) return;

    // Find the first unanswered topic in this dzial
    const dzialTopics = topics.filter((t) => t.dzial_numer === dzial.numer);
    
    let firstUnansweredTopic = null;
    for (const topic of dzialTopics) {
      const passed = isQuestionPassed(topic, userSessions);
      if (!passed) {
        const variantCode = topic.wariant as 'A'|'B'|'C'|'D' | undefined;
        if (!variantCode || (dzial.variants && dzial.variants[variantCode]?.isUnlocked !== false)) {
          firstUnansweredTopic = topic;
          break;
        }
      }
    }

    const topicToStart = firstUnansweredTopic || dzialTopics[0];
    
    if (topicToStart) {
      onSelectTopic(topicToStart.id);
    }
  };

  const toggleExpand = (dzialNumer: number) => {
    setExpandedDzial(prev => prev === dzialNumer ? null : dzialNumer);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {dzialyProgress.map((dzial) => {
          const dzialTopics = topics.filter((t) => t.dzial_numer === dzial.numer);
          const isExpanded = expandedDzial === dzial.numer;

          return (
            <div
              key={dzial.numer}
              className={`w-full text-left rounded-xl border-[2.5px] border-slate-900 transition-all ${
                dzial.isCompleted
                  ? 'bg-emerald-50/70 shadow-[4px_4px_0px_#065f46]'
                  : dzial.isUnlocked
                  ? 'bg-white shadow-[4px_4px_0px_#0f172a]'
                  : 'bg-slate-100/80 opacity-85 shadow-[2px_2px_0px_#0f172a]'
              }`}
            >
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
                      <span className="px-2.5 py-1 rounded-md border-2 border-emerald-900 bg-emerald-200 text-emerald-950 font-extrabold text-xs tracking-wider uppercase shadow-[1.5px_1.5px_0px_#065f46]">
                        Ukończony (100%)
                      </span>
                    ) : dzial.isUnlocked ? (
                      <span className="px-2.5 py-1 rounded-md border-2 border-slate-900 bg-amber-200 text-slate-900 font-extrabold text-xs tracking-wider uppercase shadow-[1.5px_1.5px_0px_#0f172a]">
                        W trakcie ({dzial.percentage}%)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md border-2 border-slate-400 bg-slate-200 text-slate-600 font-extrabold text-xs tracking-wider uppercase shadow-[1.5px_1.5px_0px_#94a3b8]">
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
                      className={`h-full transition-all duration-300 ${
                        dzial.isCompleted ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${dzial.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Footer action of chapter card */}
                <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-dashed border-slate-300">
                  <span className="text-xs font-bold text-slate-500">
                    {dzial.isUnlocked ? 'Wybierz akcję poniżej' : `Wymaga zaliczenia Działu ${dzial.numer - 1}`}
                  </span>
                  
                  {dzial.isUnlocked && (
                    <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => toggleExpand(dzial.numer)}
                        className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-extrabold rounded-lg border-2 border-slate-900 bg-white hover:bg-slate-100 text-slate-800 shadow-[2px_2px_0px_#0f172a] transition-all uppercase tracking-wide cursor-pointer"
                      >
                        {isExpanded ? 'Zwiń dział ↑' : 'Podgląd Działu ↓'}
                      </button>
                      
                      <button
                        type="button"
                        disabled={creating}
                        onClick={() => handleDzialClick(dzial)}
                        className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-black rounded-lg border-2 border-slate-900 sketch-btn-black transition-all uppercase tracking-wide cursor-pointer text-center"
                      >
                        Pytanie →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {!compact && isExpanded && dzial.variants && (
                <div className="border-t-[2.5px] border-slate-900 bg-amber-50/30 p-4 sm:p-5 space-y-6">
                  {!dzial.isUnlocked && (
                    <div className="p-3 rounded-lg border-2 border-dashed border-slate-400 bg-slate-100 text-slate-700 text-sm font-bold">
                      Ten dział jest zablokowany. Aby go odblokować, zalicz wszystkie warianty (A, B, C, D) w Dziale {dzial.numer - 1}.
                    </div>
                  )}

                  {(['A', 'B', 'C', 'D'] as const).map((vCode) => {
                    const vProg = dzial.variants![vCode];
                    if (!vProg) return null;
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
                              <span className="px-2 py-0.5 rounded border border-slate-900 bg-amber-200 font-extrabold text-xs uppercase">
                                {vMeta.nazwa}
                              </span>
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
