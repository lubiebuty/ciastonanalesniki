'use client';

import { useRouter } from 'next/navigation';
import type { Topic } from '@/lib/topics';
import {
  computeFrejerDzialyProgress,
  isQuestionPassed,
  type DzialProgress,
} from '@/lib/frejer';

interface TopicData extends Topic {}

interface FrejerChaptersViewProps {
  topics: TopicData[];
  userSessions: any[];
  onSelectTopic: (topicId: string) => void;
  creating: boolean;
  compact?: boolean;
}

export default function FrejerChaptersView({
  topics,
  userSessions,
  creating,
  compact = false,
}: FrejerChaptersViewProps) {
  const router = useRouter();
  const dzialyProgress: DzialProgress[] = computeFrejerDzialyProgress(topics, userSessions);

  const handleDzialClick = (dzial: DzialProgress) => {
    if (!dzial.isUnlocked || creating) return;
    router.push(`/frejer/${dzial.numer}`);
  };

  return (
    <div className="space-y-6 font-sketch">
      {dzialyProgress.map((dzial) => {
        const isCompleted = dzial.isCompleted;
        const isUnlocked = dzial.isUnlocked;

        return (
          <button
            key={dzial.numer}
            type="button"
            disabled={!isUnlocked || creating}
            onClick={() => handleDzialClick(dzial)}
            className={`w-full text-left rounded-3xl border-[3.5px] border-slate-900 transition-all overflow-hidden ${
              isCompleted
                ? 'bg-emerald-50 hover:bg-emerald-100 shadow-[6px_6px_0px_#065f46] cursor-pointer'
                : isUnlocked
                ? 'bg-white hover:bg-amber-50 shadow-[6px_6px_0px_#0f172a] hover:shadow-[8px_8px_0px_#0f172a] cursor-pointer hover:-translate-y-1'
                : 'bg-slate-100/90 opacity-80 shadow-[3px_3px_0px_#0f172a] cursor-not-allowed'
            }`}
          >
            <div className="p-5 sm:p-7 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-[3.5px] border-dashed border-slate-900 pb-5">
                <div className="flex items-start gap-4">
                  <span
                    className={`shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl border-[3.5px] font-black text-2xl shadow-[3px_3px_0px_#0f172a] ${
                      isCompleted 
                        ? 'bg-emerald-300 border-emerald-900 text-emerald-950' 
                        : !isUnlocked 
                        ? 'bg-slate-200 border-slate-400 text-slate-500 shadow-none' 
                        : 'bg-amber-300 border-slate-900 text-slate-900'
                    }`}
                  >
                    {dzial.rzymski}
                  </span>
                  <div>
                    <h3 className={`text-xl sm:text-2xl font-black uppercase tracking-wider ${!isUnlocked ? 'text-slate-500' : 'text-slate-900'}`}>
                      {dzial.nazwa}
                    </h3>
                    <p className={`text-sm sm:text-base font-bold mt-1.5 ${!isUnlocked ? 'text-slate-400' : 'text-slate-600'}`}>
                      {dzial.opis}
                    </p>
                  </div>
                </div>

                <div className="flex items-center self-start">
                  {isCompleted ? (
                    <span className="px-3 py-1.5 rounded-xl border-[3px] border-emerald-900 bg-emerald-200 text-emerald-950 font-black text-xs sm:text-sm tracking-widest uppercase shadow-[2.5px_2.5px_0px_#065f46]">
                      Ukończony
                    </span>
                  ) : isUnlocked ? (
                    <span className="px-3 py-1.5 rounded-xl border-[3px] border-slate-900 bg-amber-200 text-slate-900 font-black text-xs sm:text-sm tracking-widest uppercase shadow-[2.5px_2.5px_0px_#0f172a]">
                      W trakcie
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl border-[3px] border-slate-400 bg-slate-200 text-slate-500 font-black text-xs sm:text-sm tracking-widest uppercase shadow-[2.5px_2.5px_0px_#94a3b8]">
                      Zablokowany
                    </span>
                  )}
                </div>
              </div>

              {/* Action footer */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs sm:text-sm font-black text-slate-500 uppercase tracking-widest">
                  {isUnlocked ? 'Kliknij, aby trenować' : `Wymaga zaliczenia części ${dzial.numer - 1}`}
                </span>
                
                {isUnlocked && (
                  <span className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-widest border-b-[3.5px] border-slate-900 pb-0.5 group-hover:text-amber-700 transition-colors">
                    Rozpocznij Test →
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
