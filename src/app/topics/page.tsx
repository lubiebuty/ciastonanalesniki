'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Topic {
  id: string;
  numer: number;
  pytanie: string;
  odpowiedz: string;
  przedmiot?: string;
}

function TopicsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramPrzedmiot = searchParams.get('przedmiot');

  const [activeSubject, setActiveSubject] = useState<string>(() => {
    if (paramPrzedmiot && (paramPrzedmiot === 'polski' || paramPrzedmiot === 'matematyka')) {
      return paramPrzedmiot;
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selected_przedmiot');
      if (saved && (saved === 'polski' || saved === 'matematyka')) {
        return saved;
      }
    }
    return 'matematyka';
  });

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedTopicToConfirm, setSelectedTopicToConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { update } = useSession();

  // Sync activeSubject whenever URL search params change
  useEffect(() => {
    const p = searchParams.get('przedmiot');
    if (p && (p === 'polski' || p === 'matematyka') && p !== activeSubject) {
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

      if (res.ok && data.session) {
        // Refresh client-side NextAuth session to sync token count
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
    if (topics.length === 0) return;
    const random = topics[Math.floor(Math.random() * topics.length)];
    setSelectedTopicToConfirm(random.id);
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(topics.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTopics = topics.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 sm:pb-5">
          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Wybierz zadanie
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              Wybierz zagadnienie z listy lub wylosuj wyzwanie
            </p>
          </div>
          <Link
            href="/"
            className="self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            ← Strona główna
          </Link>
        </div>

        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => handleSubjectChange('matematyka')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeSubject === 'matematyka'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📐 Matematyka
          </button>
          <button
            type="button"
            onClick={() => handleSubjectChange('polski')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeSubject === 'polski'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📖 Język Polski
          </button>
        </div>

        {/* Random Draw Button */}
        <button
          onClick={drawRandom}
          disabled={creating || topics.length === 0}
          className={`w-full rounded-xl p-4 font-semibold text-sm shadow-xs transition-colors active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-white ${
            activeSubject === 'matematyka' ? 'bg-indigo-950 hover:bg-indigo-900' : 'bg-amber-950 hover:bg-amber-900'
          }`}
        >
          <span>
            Wylosuj zadanie ({activeSubject === 'matematyka' ? 'Matematyka' : 'Język Polski'})
          </span>
          <span aria-hidden="true">→</span>
        </button>

        {/* Topics List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
            <p className="text-base font-bold text-slate-800">Brak zadań w wybranym przedmiocie</p>
            <p className="text-xs text-slate-500">Wkrótce pojawią się tu nowe pytania.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopicToConfirm(topic.id)}
                disabled={creating}
                className="w-full text-left group rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 p-4 sm:p-5 space-y-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs sm:text-sm font-bold font-mono border ${
                    activeSubject === 'polski'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                  }`}>
                    Zadanie #{topic.numer}
                  </span>
                  <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                    Rozwiąż →
                  </span>
                </div>
                <p className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
                  {topic.pytanie}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              ← Poprzednia
            </button>
            <span className="text-xs font-medium text-slate-500">
              Strona <strong className="text-slate-900 font-bold">{currentPage}</strong> z{' '}
              <strong className="text-slate-900 font-bold">{totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Następna →
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedTopicToConfirm && (() => {
        const topic = topics.find((t) => t.id === selectedTopicToConfirm);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200">
                  Gotowy na wyzwanie?
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Potwierdź start zadania
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Rozpoczęcie wyzwania pobierze z Twojego konta <strong className="text-slate-900">1 token</strong>.
                </p>
              </div>

              {/* Topic details */}
              {topic && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold font-mono bg-white text-slate-800 border border-slate-200">
                    Zadanie #{topic.numer}
                  </span>
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    {topic.pytanie}
                  </p>
                </div>
              )}

              {/* Rules Info */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <p className="font-semibold text-slate-900">
                  Jak to działa:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Nagraj wypowiedź głosem lub wpisz rozwiązanie tekstem.</li>
                  <li>Model przeanalizuje poprawność toku rozumowania.</li>
                  <li>Otrzymasz punktację 0–10 oraz wskazówki krok po kroku.</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setSelectedTopicToConfirm(null)}
                  disabled={creating}
                  className="flex-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-3 font-semibold text-xs text-slate-700 shadow-2xs transition-colors active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  Wróć
                </button>
                <button
                  onClick={() => selectTopic(selectedTopicToConfirm)}
                  disabled={creating}
                  className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white p-3 font-semibold text-xs shadow-xs transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {creating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Ładowanie...</span>
                    </>
                  ) : (
                    <span>Rozpocznij wyzwanie ✨</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}

export default function TopicsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background p-8 flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Ładowanie zagadnień...</p>
      </main>
    }>
      <TopicsList />
    </Suspense>
  );
}
