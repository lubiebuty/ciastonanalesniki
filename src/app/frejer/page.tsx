'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Topic } from '@/lib/topics';
import FrejerChaptersView from '@/components/FrejerChaptersView';
import NoTokensModal from '@/components/NoTokensModal';

interface TopicData {
  id: string;
  numer: number;
  pytanie: string;
  przedmiot: string;
  dzial_nazwa?: string;
  wariant?: string;
  dzial_numer?: number;
  id_slug?: string;
}

export default function FrejerPage() {
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  
  const [selectedTopicToConfirm, setSelectedTopicToConfirm] = useState<string | null>(null);
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

  const handleTopicClick = (topicId: string) => {
    setSelectedTopicToConfirm(topicId);
  };

  const selectTopic = async (topicId: string) => {
    setCreating(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 402 || data.error?.includes('tokens')) {
          setShowNoTokensModal(true);
        } else {
          alert('Błąd podczas tworzenia sesji: ' + (data.error || 'Nieznany błąd'));
        }
        setCreating(false);
        return;
      }
      
      router.push(`/exam/${data.session.id}`);
    } catch (error) {
      console.error(error);
      alert('Wystąpił błąd podczas tworzenia sesji');
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 text-slate-900 font-sans pb-20 sm:pb-32 selection:bg-slate-900 selection:text-white">
      {/* Removed HEADER BAR and HERO BANNER as per instructions */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 mt-8">
        {/* ═════════════════════════════════════════════════════════════════
            CHAPTERS VIEW
            ═════════════════════════════════════════════════════════════════ */}
        <div className="sketch-box p-6 sm:p-8 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-[3px] border-dashed border-slate-900 pb-4">
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center p-2 rounded-xl border-[2.5px] border-slate-900 bg-white hover:bg-slate-50 shadow-[3px_3px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all w-fit"
                aria-label="Wróć na stronę główną"
              >
                <svg className="w-6 h-6 stroke-slate-900 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </Link>
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 rounded-md border-2 border-slate-900 bg-amber-200 font-extrabold text-xs uppercase tracking-wider text-slate-900 shadow-[2px_2px_0px_#0f172a]">
                  The Playbook
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-wide leading-tight text-slate-900">
                  Trening Cwaniaczka
                </h2>
                <p className="text-sm font-bold text-slate-500">
                  System zagrywek podzielony na 4 działy (od podstawowych do zaawansowanych).
                </p>
              </div>
            </div>
          </div>

          {topicsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-slate-900 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : topics.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <p className="text-slate-600 text-lg font-bold">Brak pytań z Playbooka w bazie danych.</p>
            </div>
          ) : (
            <FrejerChaptersView
              topics={topics as any}
              userSessions={sessions}
              onSelectTopic={(topicId) => handleTopicClick(topicId)}
              creating={creating}
              compact={false}
            />
          )}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          CONFIRMATION MODAL
          ═════════════════════════════════════════════════════════════════ */}
      {selectedTopicToConfirm && (() => {
        const topic = topics.find((t) => t.id === selectedTopicToConfirm);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-2xl border-[3px] border-slate-900 bg-white p-6 sm:p-7 shadow-[8px_8px_0px_#0f172a] space-y-5 animate-in zoom-in-95 duration-150">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-slate-900 text-xs font-bold border border-slate-900">
                  Gotowy na wyzwanie?
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">
                  Potwierdź start zadania
                </h2>
                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                  Rozpoczęcie wyzwania pobierze z Twojego konta <strong className="text-slate-900">1 token</strong>.
                </p>
              </div>

              {topic && (
                <div className="rounded-xl border-2 border-slate-900 bg-amber-50/50 p-4 space-y-1.5 shadow-[2px_2px_0px_#0f172a]">
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold bg-white text-slate-900 border border-slate-900">
                    Zadanie
                  </span>
                  <p className="text-base font-bold text-slate-900 leading-relaxed">
                    {topic.pytanie}
                  </p>
                </div>
              )}

              <div className="rounded-xl border-2 border-dashed border-slate-300 p-4 text-xs font-bold text-slate-600 space-y-1.5">
                <p className="font-extrabold text-slate-900 uppercase">
                  Zasady:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Nagraj wypowiedź głosem lub wpisz tekst.</li>
                  <li>Otrzymasz punktację 0–10 za jakość zagrywki.</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedTopicToConfirm(null)}
                  disabled={creating}
                  className="flex-1 sketch-btn p-3 font-extrabold text-sm"
                >
                  Wróć
                </button>
                <button
                  type="button"
                  onClick={() => selectTopic(selectedTopicToConfirm)}
                  disabled={creating}
                  className="flex-1 sketch-btn-black p-3 font-extrabold text-sm flex items-center justify-center gap-2"
                >
                  {creating ? 'Trwa przygotowywanie...' : 'Rozpocznij Test'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <NoTokensModal
        isOpen={showNoTokensModal}
        onClose={() => setShowNoTokensModal(false)}
      />
    </div>
  );
}
