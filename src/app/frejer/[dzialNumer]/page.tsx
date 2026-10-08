'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import type { Topic } from '@/lib/topics';
import { computeFrejerDzialyProgress, isQuestionPassed } from '@/lib/frejer';
import { getGameOrderIndex } from '@/lib/frejer_play_order';
import NoTokensModal from '@/components/NoTokensModal';

interface TopicData extends Topic {}

interface GameGroup {
  id: string; // e.g. "playbook-chap4-play1"
  title: string;
  subtitle: string;
  topics: TopicData[];
  pdfPath?: string;
}

import gamesMasterRaw from '@/lib/games_master.json';
const gamesMaster = gamesMasterRaw as Record<string, any[]>;

export default function FrejerGamesPage() {
  const { dzialNumer } = useParams();
  const dzialNumerInt = parseInt(dzialNumer as string, 10);
  
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [showNoTokensModal, setShowNoTokensModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        setTopicsLoading(true);
        const [topicsRes, sessionsRes] = await Promise.all([
          fetch('/api/topics?przedmiot=frejer'),
          fetch('/api/sessions')
        ]);
        
        if (topicsRes.ok) {
          const tData = await topicsRes.json();
          setTopics(tData.topics || []);
        }
        if (sessionsRes.ok) {
          const sData = await sessionsRes.json();
          setSessions(sData.sessions || []);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setTopicsLoading(false);
      }
    }
    loadData();
  }, []);

  const dzialTopics = topics.filter(t => t.dzial_numer === dzialNumerInt);
  const dzialyProgress = computeFrejerDzialyProgress(topics, sessions);
  const currentDzialProgress = dzialyProgress.find(d => d.numer === dzialNumerInt);

  // Group topics by game from games_master.json!
  const masterList = gamesMaster[dzialNumerInt] || [];
  const gameGroups: GameGroup[] = masterList.map((g: any) => {
    // The master file has the topics, but we need the LIVE topics array to check progress, etc.
    // So we match by id_slug prefixes
    const gameId = g.topics && g.topics[0] ? g.topics[0].id_slug.split('-var')[0] : `playbook-chap${dzialNumerInt}-play${g.index}`;
    
    // Find live topics for this game
    const liveTopics = dzialTopics.filter(t => t.id_slug?.startsWith(gameId));
    
    return {
      id: gameId,
      title: g.title,
      subtitle: 'Zagrywka',
      topics: liveTopics.length > 0 ? liveTopics : g.topics,
      pdfPath: g.pdfPath, // attach pdfPath explicitly!
    };
  });

  const handleGameClick = async (game: GameGroup) => {
    if (creating || !currentDzialProgress) return;
    
    // Sort just to be sure we go A -> B -> C
    const sortedTopics = [...game.topics].sort((a, b) => (a.wariant || '').localeCompare(b.wariant || ''));

    router.push(`/frejer/game/${game.id}`);
  };

  return (
    <main className="min-h-screen bg-slate-100 pb-12 pt-16 sm:pt-24 selection:bg-amber-200 selection:text-slate-900 overflow-x-hidden font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 mt-8">
        
        {/* Header */}
        <div className="sketch-box p-6 sm:p-8 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-[3px] border-dashed border-slate-900 pb-4">
            <div className="space-y-4">
              <Link
                href="/frejer"
                className="inline-flex items-center justify-center p-2 rounded-xl border-[2.5px] border-slate-900 bg-white hover:bg-slate-50 shadow-[3px_3px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all w-fit"
                aria-label="Wróć do działów"
              >
                <svg className="w-6 h-6 stroke-slate-900 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </Link>
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 rounded-md border-2 border-slate-900 bg-amber-200 font-extrabold text-xs uppercase tracking-wider text-slate-900 shadow-[2px_2px_0px_#0f172a]">
                  Dział {currentDzialProgress?.rzymski || dzialNumerInt}
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-wide leading-tight text-slate-900">
                  {currentDzialProgress?.nazwa || "Ładowanie..."}
                </h2>
                <p className="text-sm font-bold text-slate-500">
                  Wybierz zdjęcie zagrywki z listy poniżej, by rozpocząć trening.
                </p>
              </div>
            </div>
          </div>
        </div>

        {topicsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : gameGroups.length === 0 ? (
          <div className="py-12 text-center space-y-4 bg-white sketch-box p-8">
            <p className="text-slate-500 font-bold text-lg">Brak zagrywek w tym dziale.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" dir="rtl">
            {gameGroups.map((game, idx) => {
              const passedVariants = game.topics.filter((t: any) => isQuestionPassed(t, sessions)).length;
              const isFullyPassed = passedVariants === game.topics.length;
              
              return (
                <div
                  key={game.id}
                  dir="ltr"
                  onClick={() => handleGameClick(game as any)}
                  className={`
                    relative bg-white rounded-xl p-4 transition-all duration-300
                    border-[3px] border-slate-900 shadow-[6px_6px_0px_#0f172a]
                    hover:-translate-y-1 hover:shadow-[8px_8px_0px_#0f172a] cursor-pointer
                    flex flex-col gap-4 items-center text-center
                  `}
                >
                  <div className="w-full aspect-square relative rounded-lg border-[3px] border-slate-900 overflow-hidden bg-slate-50 shadow-[4px_4px_0px_#0f172a]">
                    {(game as any).pdfPath ? (
                      <iframe
                        src={`${(game as any).pdfPath}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full pointer-events-none scale-100"
                        style={{ overflow: 'hidden' }}
                        scrolling="no"
                      />
                    ) : (
                      <img
                        src={`/images/frejer/${game.id}.jpg`}
                        onError={(e) => {
                          e.currentTarget.src = "/images/frejer-placeholder.jpg";
                        }}
                        alt={game.title}
                        className="w-full h-full object-cover p-1 bg-white"
                      />
                    )}
                    
                    {isFullyPassed && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-sm pointer-events-none">
                        <div className="bg-white border-[3px] border-slate-900 p-2 rounded-full rotate-12 shadow-[4px_4px_0px_#0f172a]">
                          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 w-full pt-2 border-t-[3px] border-dashed border-slate-900 mt-2">
                    <h3 className="font-extrabold text-xl text-slate-900 leading-tight font-comic">
                      {game.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-comic">
                      {passedVariants} / {game.topics.length} Zaliczone
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
      <NoTokensModal isOpen={showNoTokensModal} onClose={() => setShowNoTokensModal(false)} />
    </main>
  );
}
