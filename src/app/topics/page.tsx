'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import GeografiaChaptersView from '@/components/GeografiaChaptersView';
import NoTokensModal from '@/components/NoTokensModal';
import { getNextTopic } from '@/lib/geografia';

interface Topic {
  id: string;
  numer: number;
  pytanie: string;
  odpowiedz: string;
  przedmiot?: string;
  dzial_numer?: number;
  dzial_nazwa?: string;
  wariant?: string;
  numer_pytania?: number;
  notatka?: string | null;
  id_slug?: string;
}

function TopicsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramPrzedmiot = searchParams.get('przedmiot');

  const [activeSubject, setActiveSubject] = useState<string>(() => {
    if (paramPrzedmiot && (paramPrzedmiot === 'polski' || paramPrzedmiot === 'matematyka' || paramPrzedmiot === 'geografia')) {
      return paramPrzedmiot;
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selected_przedmiot');
      if (saved && (saved === 'polski' || saved === 'matematyka' || saved === 'geografia')) {
        return saved;
      }
    }
    return 'matematyka';
  });

  const [topics, setTopics] = useState<Topic[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedTopicToConfirm, setSelectedTopicToConfirm] = useState<string | null>(null);
  const [showNoTokensModal, setShowNoTokensModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: session, update } = useSession();

  const handleTopicClick = (topicId: string) => {
    if ((session?.tokens ?? 0) <= 0) {
      setShowNoTokensModal(true);
      return;
    }
    setSelectedTopicToConfirm(topicId);
  };

  // Load user sessions for progress tracking
  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []))
      .catch(() => setSessions([]));
  }, []);

  // Sync activeSubject whenever URL search params change
  useEffect(() => {
    const p = searchParams.get('przedmiot');
    if (p && (p === 'polski' || p === 'matematyka' || p === 'geografia') && p !== activeSubject) {
      setActiveSubject(p);
    }
  }, [searchParams, activeSubject]);

  const handleSubjectChange = (subject: string) => {
    setActiveSubject(subject);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_przedmiot', subject);
    }
    router.replace(`/topics?przedmiot=${subject}`, { scroll: false });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_przedmiot', activeSubject);
    }
    setLoading(true);
    setCurrentPage(1);
    fetch(`/api/topics?przedmiot=${activeSubject}`)
      .then((r) => r.json())
      .then((d) => setTopics(d.topics || []))
      .finally(() => setLoading(false));
  }, [activeSubject]);

  const selectTopic = async (topicId: string) => {
    if ((session?.tokens ?? 0) <= 0) {
      setSelectedTopicToConfirm(null);
      setShowNoTokensModal(true);
      return;
    }

    if (creating) return;
    setCreating(true);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('selected_przedmiot', activeSubject);
      }
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      });

      const data = await res.json();

      if (res.status === 402 || data.error?.toLowerCase().includes('token')) {
        setSelectedTopicToConfirm(null);
        setShowNoTokensModal(true);
        return;
      }

      if (res.ok && data.session) {
        await update();
        setSelectedTopicToConfirm(null);
        router.push(`/exam/${data.session.id}`);
      } else {
        alert(data.error || 'Nie udało się rozpocząć sesji');
      }
    } catch {
      alert('Błąd połączenia z serwerem');
    } finally {
      setCreating(false);
    }
  };

  const drawRandom = () => {
    if ((session?.tokens ?? 0) <= 0) {
      setShowNoTokensModal(true);
      return;
    }
    if (topics.length === 0) return;
    const random = topics[Math.floor(Math.random() * topics.length)];
    setSelectedTopicToConfirm(random.id);
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(topics.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTopics = topics.slice(indexOfFirstItem, indexOfLastItem);

  const subjectLabel =
    activeSubject === 'matematyka'
      ? 'Matematyka'
      : activeSubject === 'polski'
      ? 'Język Polski'
      : 'Geografia';

  return (
    <main className="min-h-screen p-3 sm:p-6 md:p-10 font-sketch">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* ═════════════════════════════════════════════════════════════════
            HEADER: DZIAŁY — LISTA KAFLI (Pages 7 & 8 Concept)
            ═════════════════════════════════════════════════════════════════ */}
        <div className="sketch-box p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-wider text-slate-900 uppercase">
              Działy — Lista Kafli
            </h1>
            <p className="text-sm sm:text-base font-bold text-slate-600">
              Wybierz zadanie z zeszytu lub przejdź do kolejnego zadania
            </p>
          </div>

          <Link
            href="/"
            className="sketch-btn px-4 py-2 text-sm font-extrabold self-start sm:self-auto"
          >
            ← Strona główna
          </Link>
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            SUBJECT SWITCHER TABS (Notebook Tabs)
            ═════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSubjectChange('matematyka')}
            className={`flex-1 py-3 px-3 font-extrabold text-sm sm:text-base tracking-wide rounded-xl border-[2.5px] border-slate-900 transition-all cursor-pointer ${
              activeSubject === 'matematyka'
                ? 'bg-amber-100 text-slate-900 shadow-[4px_4px_0px_#0f172a] scale-[1.01]'
                : 'bg-white text-slate-700 hover:bg-slate-50 shadow-[2px_2px_0px_#0f172a]'
            }`}
          >
            Matematyka
          </button>
          <button
            type="button"
            onClick={() => handleSubjectChange('polski')}
            className={`flex-1 py-3 px-3 font-extrabold text-sm sm:text-base tracking-wide rounded-xl border-[2.5px] border-slate-900 transition-all cursor-pointer ${
              activeSubject === 'polski'
                ? 'bg-amber-100 text-slate-900 shadow-[4px_4px_0px_#0f172a] scale-[1.01]'
                : 'bg-white text-slate-700 hover:bg-slate-50 shadow-[2px_2px_0px_#0f172a]'
            }`}
          >
            Język Polski
          </button>
          <button
            type="button"
            onClick={() => handleSubjectChange('geografia')}
            className={`flex-1 py-3 px-3 font-extrabold text-sm sm:text-base tracking-wide rounded-xl border-[2.5px] border-slate-900 transition-all cursor-pointer ${
              activeSubject === 'geografia'
                ? 'bg-amber-100 text-slate-900 shadow-[4px_4px_0px_#0f172a] scale-[1.01]'
                : 'bg-white text-slate-700 hover:bg-slate-50 shadow-[2px_2px_0px_#0f172a]'
            }`}
          >
            Geografia
          </button>
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            CTA BUTTON (Hand-drawn CTA) — Only for Math & Polish
            ═════════════════════════════════════════════════════════════════ */}
        {activeSubject !== 'geografia' && (
          <button
            onClick={drawRandom}
            disabled={creating || topics.length === 0}
            className="w-full sketch-btn-black p-4 font-extrabold text-base sm:text-lg tracking-wide flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
          >
            <span>Wylosuj zadanie ({subjectLabel})</span>
            <span aria-hidden="true">→</span>
          </button>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            TOPICS TILES / GEOGRAFIA CHAPTERS VIEW
            ═════════════════════════════════════════════════════════════════ */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-[3.5px] border-slate-900 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : topics.length === 0 ? (
          <div className="sketch-box p-8 sm:p-12 text-center space-y-2">
            <p className="text-xl font-extrabold text-slate-900 uppercase">
              Brak zadań w wybranym dziale
            </p>
            <p className="text-sm font-bold text-slate-500">
              Wkrótce pojawią się tu nowe zagadnienia.
            </p>
          </div>
        ) : activeSubject === 'geografia' ? (
          <GeografiaChaptersView
            topics={topics}
            userSessions={sessions}
            onSelectTopic={(topicId) => handleTopicClick(topicId)}
            creating={creating}
            compact={false}
          />
        ) : (
          <div className="space-y-3.5">
            {currentTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic.id)}
                disabled={creating}
                className="w-full text-left group rounded-xl border-[2.5px] border-slate-900 bg-white hover:bg-amber-50/50 p-4 sm:p-5 space-y-2 shadow-[4px_4px_0px_#0f172a] hover:shadow-[5px_5px_0px_#0f172a] transition-all disabled:opacity-50 cursor-pointer relative overflow-hidden"
              >
                {/* Subtle pencil hatch line accent on left border */}
                <div className="absolute left-0 top-0 bottom-0 w-2 sketch-hatch opacity-60 pointer-events-none" />

                <div className="flex items-center justify-between gap-2 pl-2">
                  <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs sm:text-sm font-extrabold border-2 border-slate-900 bg-amber-100 text-slate-900 shadow-[1px_1px_0px_#0f172a]">
                    Zadanie #{topic.numer}
                  </span>
                  <span className="text-sm font-extrabold text-slate-700 group-hover:text-slate-950 group-hover:translate-x-1 transition-all">
                    Rozwiąż →
                  </span>
                </div>

                <p className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug pl-2">
                  {topic.pytanie}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            PAGINATION CONTROLS (Hand-drawn Buttons) - Only for Math & Polish
            ═════════════════════════════════════════════════════════════════ */}
        {activeSubject !== 'geografia' && totalPages > 1 && (
          <div className="flex items-center justify-between border-t-2 border-dashed border-slate-300 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="sketch-btn px-4 py-2 text-sm font-extrabold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Poprzednia
            </button>
            <span className="text-sm sm:text-base font-extrabold text-slate-800">
              Strona {currentPage} z {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="sketch-btn px-4 py-2 text-sm font-extrabold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Następna →
            </button>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            CONFIRMATION MODAL (Wimpy Memo Card)
            ═════════════════════════════════════════════════════════════════ */}
        {selectedTopicToConfirm && (() => {
          const topic = topics.find((t) => t.id === selectedTopicToConfirm);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-lg rounded-2xl border-[3px] border-slate-900 bg-white p-6 sm:p-7 shadow-[8px_8px_0px_#0f172a] space-y-5 animate-in zoom-in-95 duration-150">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-slate-900 text-xs font-bold border border-slate-900">
                    Rozpocząć wyzwanie?
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">
                    Potwierdź zadanie
                  </h2>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    Rozpoczęcie wyzwania pobierze z Twojego konta <strong className="text-slate-900">1 token</strong>.
                  </p>
                </div>

                {topic && (
                  <div className="rounded-xl border-2 border-slate-900 bg-amber-50/50 p-4 space-y-1.5 shadow-[2px_2px_0px_#0f172a]">
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold bg-white text-slate-900 border border-slate-900">
                      Zadanie #{topic.numer}
                    </span>
                    <p className="text-base font-bold text-slate-900 leading-relaxed">
                      {topic.pytanie}
                    </p>
                  </div>
                )}

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
                    {creating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Ładowanie...</span>
                      </>
                    ) : (
                      <span>Rozpocznij wyzwanie</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      </div>

      {/* No Tokens Modal Window */}
      <NoTokensModal
        isOpen={showNoTokensModal}
        onClose={() => setShowNoTokensModal(false)}
      />
    </main>
  );
}

export default function TopicsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen p-8 flex items-center justify-center font-sketch">
        <p className="text-xl font-bold animate-pulse text-slate-900">Ładowanie zeszytu z zadaniami...</p>
      </main>
    }>
      <TopicsList />
    </Suspense>
  );
}
