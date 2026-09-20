'use client';

import { useState } from 'react';
import type { Topic } from '@/lib/topics';
import { WARIANTY_METADATA } from '@/lib/geografia';
import {
  computeFrejerDzialyProgress,
  isQuestionPassed,
  getFlashcardImagePath,
  type DzialProgress,
} from '@/lib/frejer';
import type { UserSessionMinimal } from '@/lib/geografia';

interface TopicData extends Topic {}

interface FrejerChaptersViewProps {
  topics: TopicData[];
  userSessions: any[];
  onSelectTopic: (topicId: string) => void;
  creating: boolean;
  compact?: boolean;
  initialExpandedDzial?: number | null;
}



// Helper: group topics in a dzial by "game" (extracted from id_slug, e.g. "playbook-chap4-play1")
function groupTopicsByGame(dzialTopics: TopicData[]) {
  const gamesMap = new Map<string, TopicData[]>();
  
  for (const topic of dzialTopics) {
    if (!topic.id_slug) continue;
    // id_slug format: playbook-chapX-playY-varZ
    const parts = topic.id_slug.split('-');
    const gameId = parts.slice(0, 3).join('-'); // e.g. "playbook-chap4-play1"
    
    if (!gamesMap.has(gameId)) {
      gamesMap.set(gameId, []);
    }
    gamesMap.get(gameId)!.push(topic);
  }
  
  // Convert map to array and sort by game index (play1, play2, etc.)
  const gamesArray = Array.from(gamesMap.entries()).map(([gameId, topics]) => {
    // extract "play1" -> 1
    const playMatch = gameId.match(/play(\d+)/);
    const order = playMatch ? parseInt(playMatch[1], 10) : 999;
    
    // Sort variants A, B, C within the game
    topics.sort((a, b) => (a.wariant || '').localeCompare(b.wariant || ''));
    
    const firstQ = topics[0]?.pytanie || '';
    const nameMatch = firstQ.match(/[„"]([^”"]+)[”"]/);
    const name = nameMatch ? nameMatch[1] : `Zagrywka #${order}`;
    
    const image_path = getFlashcardImagePath(topics[0]);

    return {
      gameId,
      order,
      topics,
      name,
      image_path
    };
  });
  
  gamesArray.sort((a, b) => a.order - b.order);
  return gamesArray;
}

export default function FrejerChaptersView({
  topics,
  userSessions,
  onSelectTopic,
  creating,
  compact = false,
  initialExpandedDzial = null,
}: FrejerChaptersViewProps) {
  const [expandedDzial, setExpandedDzial] = useState<number | null>(initialExpandedDzial ?? (compact ? null : 4));

  const dzialyProgress: DzialProgress[] = computeFrejerDzialyProgress(topics, userSessions);

  const toggleExpand = (numer: number) => {
    if (compact) return;
    setExpandedDzial(expandedDzial === numer ? null : numer);
  };

  return (
    <div className="space-y-4">
      {dzialyProgress.map((dzial) => {
        const isExpanded = expandedDzial === dzial.numer;
        const dzialTopics = topics.filter((t) => t.dzial_numer === dzial.numer);
        const games = groupTopicsByGame(dzialTopics);

        return (
          <div
            key={dzial.numer}
            className={`
              relative overflow-hidden rounded-2xl border-[3px] transition-all duration-200
              ${dzial.isUnlocked ? 'border-slate-900 bg-white shadow-[5px_5px_0px_#0f172a]' : 'border-slate-300 bg-slate-50/50 shadow-none'}
            `}
          >
            {/* Header section */}
            <div className={`p-4 sm:p-5 ${!compact && dzial.isUnlocked ? 'cursor-pointer' : ''}`} onClick={() => dzial.isUnlocked && toggleExpand(dzial.numer)}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center min-w-[2.5rem] h-7 px-2 rounded-md border-2 font-black text-sm shadow-[2px_2px_0px_#0f172a] ${
                        dzial.isCompleted ? 'bg-emerald-400 border-emerald-900 text-emerald-950' : !dzial.isUnlocked ? 'bg-slate-200 border-slate-400 text-slate-500 shadow-none' : 'bg-amber-300 border-slate-900 text-slate-900'
                      }`}
                    >
                      {dzial.rzymski}
                    </span>
                    <h3 className={`text-lg sm:text-xl font-extrabold tracking-wide ${!dzial.isUnlocked ? 'text-slate-500' : 'text-slate-900'}`}>
                      {dzial.nazwa}
                    </h3>
                  </div>
                  <p className={`text-sm font-bold pl-12 ${!dzial.isUnlocked ? 'text-slate-400' : 'text-slate-600'}`}>
                    {dzial.opis}
                  </p>
                </div>
              </div>

              {dzial.isUnlocked && dzialTopics.length > 0 && (
                <div className="mt-4 pl-12">
                  <div className="pt-2 flex items-center justify-between border-t border-dashed border-slate-300">
                    <span className="text-xs font-bold text-slate-500">
                      {compact
                        ? (dzial.isUnlocked ? `${games.length} zagrywek` : `Wymaga zaliczenia Działu ${dzial.numer - 1}`)
                        : `${games.length} zagrywek do rozegrania`}
                    </span>

                    {compact ? (
                      <span className="text-xs font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        Podgląd
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(dzial.numer);
                        }}
                        className="sketch-btn px-3.5 py-1.5 text-xs sm:text-sm font-extrabold cursor-pointer"
                      >
                        {isExpanded ? 'Zwiń zadania ↑' : 'Rozwiń zadania ↓'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Expanded details: Games list - ONLY in full mode */}
            {!compact && isExpanded && (
              <div className="border-t-[2.5px] border-slate-900 bg-amber-50/30 p-4 sm:p-5 space-y-6">
                {!dzial.isUnlocked && (
                  <div className="rounded-xl border-2 border-slate-300 border-dashed p-4 text-center text-sm font-bold text-slate-500 bg-white">
                    Ten dział jest zablokowany. Aby go odblokować, zalicz wszystkie zagrywki w Dziale {dzial.numer - 1}.
                  </div>
                )}

                {games.map((game, gameIdx) => {
                  let isGameUnlocked = true;

                  const isGameCompleted = game.topics.every(t => isQuestionPassed(t, userSessions));

                  return (
                    <div key={game.gameId} className="space-y-3 relative">
                      {gameIdx !== 0 && <hr className="border-t-2 border-dashed border-slate-300 mb-6" />}
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-[2.5px] font-black text-sm shadow-[2px_2px_0px_#0f172a] ${isGameCompleted ? 'bg-emerald-400 border-emerald-900 text-emerald-950' : !isGameUnlocked ? 'bg-slate-200 border-slate-400 text-slate-400 shadow-none' : 'bg-white border-slate-900 text-slate-900'}`}>
                            {game.order}
                          </span>
                          <h4 className={`text-xl font-extrabold ${!isGameUnlocked ? 'text-slate-400' : 'text-slate-900'}`}>
                            {game.name}
                          </h4>
                        </div>
                        <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded border-2 shadow-[1px_1px_0px_#0f172a] ${isGameCompleted ? 'bg-emerald-200 border-emerald-900 text-emerald-900' : !isGameUnlocked ? 'bg-slate-100 border-slate-300 text-slate-400 shadow-none' : 'bg-amber-100 border-amber-900 text-amber-900'}`}>
                          {isGameCompleted ? 'Ukończono' : !isGameUnlocked ? 'Zablokowane' : 'Do zrobienia'}
                        </span>
                      </div>

                      {game.image_path && (
                        <div className="my-4 border-2 border-slate-900 rounded-xl overflow-hidden shadow-[4px_4px_0px_#0f172a] bg-white flex justify-center max-w-sm mx-auto">
                          <img
                            src={game.image_path}
                            alt={`Fiszka zagrywki: ${game.name}`}
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        {game.topics.map((topic, qIdx) => {
                          const passed = isQuestionPassed(topic, userSessions);
                          const variant = topic.wariant as 'A'|'B'|'C';
                          const vMeta = WARIANTY_METADATA[variant];
                          
                          // All variants are unlocked
                          let isVariantUnlocked = true;

                          const isLocked = !isVariantUnlocked;

                          return (
                            <button
                              key={topic.id}
                              type="button"
                              onClick={() => {
                                if (!isLocked) {
                                  onSelectTopic(topic.id);
                                }
                              }}
                              disabled={creating || isLocked}
                              className={`
                                relative p-4 rounded-xl border-2 text-left transition-all overflow-hidden group/topic flex flex-col h-full
                                ${
                                  passed
                                    ? 'border-emerald-700 bg-emerald-50/50 shadow-[3px_3px_0px_#047857]'
                                    : isLocked
                                    ? 'border-slate-300 bg-slate-50 opacity-60 cursor-not-allowed'
                                    : 'border-slate-900 bg-white shadow-[3px_3px_0px_#0f172a] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0f172a] cursor-pointer'
                                }
                              `}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg border-2 text-xs font-black shadow-[1px_1px_0px_#0f172a] ${
                                    passed
                                      ? 'bg-emerald-400 border-emerald-900 text-emerald-950'
                                      : isLocked
                                      ? 'bg-slate-200 border-slate-400 text-slate-400 shadow-none'
                                      : 'bg-white border-slate-900 text-slate-900 group-hover/topic:bg-amber-200'
                                  }`}
                                >
                                  {passed ? '✓' : topic.wariant}
                                </span>
                              </div>
                              <p className={`text-xs font-extrabold flex-grow leading-relaxed ${isLocked ? 'text-slate-400' : 'text-slate-700'}`}>
                                {topic.pytanie}
                              </p>
                            </button>
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
  );
}
