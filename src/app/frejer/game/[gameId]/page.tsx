'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import type { Topic } from '@/lib/topics';
import { computeFrejerDzialyProgress, isQuestionPassed } from '@/lib/frejer';
import NoTokensModal from '@/components/NoTokensModal';
import gamesMasterRaw from '@/lib/games_master.json';

const gamesMaster = gamesMasterRaw as Record<string, any[]>;

interface TopicData extends Topic {}

export default function GameDetailsPage() {
  const { gameId } = useParams();
  const gameIdStr = gameId as string;
  
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [showNoTokensModal, setShowNoTokensModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Ensure we only match exactly the variants for this game (prevents matching base topic or other games like play10)
  const gameTopics = topics
    .filter(t => t.id_slug?.startsWith(gameIdStr + '-var'))
    .sort((a, b) => (a.wariant || '').localeCompare(b.wariant || ''))
    .slice(0, 3); // Ensure exactly 3 questions maximum

  const dzialNumerInt = gameTopics.length > 0 ? gameTopics[0].dzial_numer : null;
  const dzialyProgress = computeFrejerDzialyProgress(topics, sessions);
  const currentDzialProgress = dzialyProgress.find(d => d.numer === dzialNumerInt);

  // Extract title from Variant A
  const variantA = gameTopics.find(t => t.wariant === 'A');
  const titleMatch = variantA?.pytanie?.match(/[„"'](.*?)[”"']/);
  const title = titleMatch ? titleMatch[1] : 'Zagrywka';

  const handleStartTopic = async (topicId: string, isLocked: boolean) => {
    if (creating) return;
    if (isLocked) {
      alert("Zablokowane! Musisz najpierw pomyślnie ukończyć poprzednią część dla tej zagrywki.");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      });

      if (!res.ok) {
        if (res.status === 403) {
          setShowNoTokensModal(true);
          setCreating(false);
          return;
        }
        throw new Error('Failed to create session');
      }

      const data = await res.json();
      router.push(`/exam/${data.session.id}`);
    } catch (err) {
      console.error(err);
      alert('Nie udało się utworzyć sesji.');
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 pb-12 pt-16 sm:pt-24 selection:bg-amber-200 selection:text-slate-900 overflow-x-hidden font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mt-8">
        
        <div className="sketch-box p-6 sm:p-8 bg-white space-y-8 flex flex-col items-center">
          <div className="w-full max-w-2xl aspect-[3/4] relative rounded-lg border-[3px] border-slate-900 overflow-hidden bg-slate-50 shadow-[4px_4px_0px_#0f172a]">
            {(() => {
              // Extract dzialNumer and playIndex from gameIdStr (e.g. playbook-chap4-play1)
              const match = gameIdStr.match(/^playbook-chap(\d+)-play(\d+)$/);
              let pdfPath = null;
              if (match) {
                const dzialNumer = parseInt(match[1]);
                const playIndex = parseInt(match[2]);
                const masterList = gamesMaster[dzialNumer] || [];
                const gameData = masterList.find((g: any) => g.index === playIndex);
                if (gameData) pdfPath = gameData.pdfPath;
              }

              if (pdfPath) {
                return (
                  <iframe
                    src={`${pdfPath}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full pointer-events-none scale-100"
                    style={{ overflow: 'hidden' }}
                    scrolling="no"
                  />
                );
              }

              // Fallback if no PDF
              return (
                <img
                  src={`/images/frejer/${gameIdStr}.jpg`}
                  onError={(e) => {
                    e.currentTarget.src = "/images/frejer-placeholder.jpg";
                  }}
                  alt={title}
                  className="w-full h-full object-contain p-1 bg-white"
                />
              );
            })()}
          </div>
          
          <div className="space-y-4 flex flex-col items-center text-center w-full max-w-2xl">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-wide leading-tight text-slate-900 font-comic">
              {title}
            </h2>
            <p className="text-slate-500 font-bold">
              Poniżej znajdują się 3 pytania przypisane do tej zagrywki.
            </p>
            {dzialNumerInt && (
              <Link
                href={`/frejer/${dzialNumerInt}`}
                className="mt-2 inline-flex items-center gap-2 p-2 px-4 rounded-xl border-[2.5px] border-slate-900 bg-white hover:bg-slate-50 shadow-[3px_3px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all w-fit font-bold"
              >
                <svg className="w-5 h-5 stroke-slate-900 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Wróć do zagrywek
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : gameTopics.length === 0 ? (
          <div className="py-12 text-center bg-white sketch-box p-8">
            <p className="text-slate-500 font-bold">Brak pytań.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {gameTopics.map((topic, idx) => {
              const passed = isQuestionPassed(topic, sessions);
              const variantCode = topic.wariant as 'A'|'B'|'C'|'D' | undefined;
              
              let isLocked = false;
              if (variantCode === 'B') {
                const varA = gameTopics.find(t => t.wariant === 'A');
                if (varA && !isQuestionPassed(varA, sessions)) isLocked = true;
              } else if (variantCode === 'C') {
                const varB = gameTopics.find(t => t.wariant === 'B');
                if (varB && !isQuestionPassed(varB, sessions)) isLocked = true;
              }
              
              return (
                <div
                  key={topic.id}
                  onClick={() => handleStartTopic(topic.id, isLocked)}
                  className={`
                    relative p-6 rounded-xl border-[3px] border-slate-900 
                    flex items-center justify-between gap-4 transition-all duration-300
                    ${isLocked 
                      ? 'bg-slate-100 opacity-60 grayscale cursor-not-allowed shadow-none' 
                      : 'bg-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0f172a] cursor-pointer shadow-[4px_4px_0px_#0f172a]'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-[3px] border-slate-900 flex items-center justify-center font-extrabold text-xl font-comic bg-amber-200">
                      {topic.wariant || idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">
                        {isLocked ? 'Zablokowane' : (topic.wariant === 'A' ? 'Rozpocznij misję' : `Część ${topic.wariant}`)}
                      </h3>
                      {!isLocked && (
                        <p className="text-sm text-slate-500 line-clamp-1">{topic.pytanie}</p>
                      )}
                    </div>
                  </div>
                  
                  {passed && (
                    <div className="bg-green-100 border-2 border-green-600 rounded-full p-2 rotate-12">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {isLocked && (
                    <div className="text-slate-400">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  )}
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
