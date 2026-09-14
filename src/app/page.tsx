'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface TopicData {
  id: string;
  numer: number;
  pytanie: string;
  odpowiedz: string;
}

type Subject = 'matematyka' | 'polski';

export default function Home() {
  const [activeSubject, setActiveSubject] = useState<Subject>('matematyka');
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedTopicToConfirm, setSelectedTopicToConfirm] = useState<string | null>(null);
  const router = useRouter();
  const { update } = useSession();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selected_przedmiot');
      if (saved === 'polski' || saved === 'matematyka') {
        setActiveSubject(saved);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_przedmiot', activeSubject);
    }
    setTopicsLoading(true);
    fetch(`/api/topics?przedmiot=${activeSubject}`)
      .then((res) => res.json())
      .then((data) => setTopics(data.topics || []))
      .catch(() => setTopics([]))
      .finally(() => setTopicsLoading(false));
  }, [activeSubject]);

  const selectTopic = async (topicId: string) => {
    if (creating) return;
    setCreating(true);

    try {
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

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">

        {/* Subject Selection Cards / Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              Wybierz przedmiot
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Matematyka Card */}
            <button
              type="button"
              onClick={() => setActiveSubject('matematyka')}
              className={`group relative text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${activeSubject === 'matematyka'
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl text-xl ${activeSubject === 'matematyka' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                    📐
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Matematyka</h3>
                    <p className="text-sm text-slate-500">Poziom Podstawowy i Rozszerzony</p>
                  </div>
                </div>
              </div>
            </button>

            {/* Język Polski Card */}
            <button
              type="button"
              onClick={() => setActiveSubject('polski')}
              className={`group relative text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${activeSubject === 'polski'
                  ? 'border-amber-600 bg-amber-50/60 shadow-md ring-2 ring-amber-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl text-xl ${activeSubject === 'polski' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                    📖
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Język Polski</h3>
                    <p className="text-sm text-slate-500">Zadania</p>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        {activeSubject === 'matematyka' ? (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 sm:p-8 md:p-12 text-white shadow-xl transition-all">
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-1/3 -top-10 w-40 h-40 bg-pink-400/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-5 sm:space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-semibold tracking-wide text-indigo-100 border border-white/20">
                Twój osobisty tutor matematyczny
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Opanuj matematykę z natychmiastową oceną AI ✨
              </h1>

              <p className="text-indigo-100 text-sm sm:text-base md:text-lg leading-relaxed">
                Wybierz zadanie, odpowiedz głosem lub wpisz rozwiązanie, a sztuczna inteligencja sprawdzi Twój tok myślenia i podpowie jak zdobyć 10/10 punktów!
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/topics?przedmiot=matematyka"
                  id="btn-start-simulation"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm sm:text-base font-bold text-indigo-950 shadow-lg hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all duration-150 text-center"
                >
                  <span>Rozpocznij zadanie</span>
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/results"
                  id="btn-view-results"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-900/50 backdrop-blur-md border border-white/20 px-5 py-3.5 text-sm sm:text-base font-bold text-white shadow-sm hover:bg-indigo-900/80 active:scale-95 transition-all duration-150 text-center"
                >
                  <span>Moje wyniki</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-rose-700 to-amber-900 p-6 sm:p-8 md:p-12 text-white shadow-xl transition-all">
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-1/3 -top-10 w-40 h-40 bg-orange-400/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-5 sm:space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-semibold tracking-wide text-amber-100 border border-white/20">
                Przedmiot: Język Polski 📖
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Trening zadań z Polskiego ✨
              </h1>

              <p className="text-amber-100 text-sm sm:text-base md:text-lg leading-relaxed">
                Ćwicz zadania z języka polskiego, analizuj lektury i sprawdzaj swoją wiedzę z automatyczną oceną AI!
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/topics?przedmiot=polski"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm sm:text-base font-bold text-amber-950 shadow-lg hover:bg-amber-50 hover:scale-105 active:scale-95 transition-all duration-150 text-center cursor-pointer"
                >
                  <span>Rozpocznij zadanie</span>
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/results"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-950/40 backdrop-blur-md border border-white/20 px-5 py-3.5 text-sm sm:text-base font-bold text-white shadow-sm hover:bg-amber-950/60 active:scale-95 transition-all duration-150 text-center"
                >
                  <span>Moje wyniki</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Content List (Matematyka vs Polski) */}
        {activeSubject === 'matematyka' ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Wybrane zadania z matematyki ({topics.length})
                </h2>
                <p className="text-sm text-slate-600">
                  Pytania z podstawy programowej z matematyki
                </p>
              </div>

              <Link
                href="/topics"
                className="text-sm font-bold text-slate-900 hover:text-slate-600 inline-flex items-center gap-1 transition-colors"
              >
                Wszystkie zadania →
              </Link>
            </div>

            {topicsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
              </div>
            ) : topics.length === 0 ? (
              <p className="text-slate-600 text-base py-4">Brak zadań z matematyki w bazie danych.</p>
            ) : (
              <div className="grid gap-3">
                {topics.slice(0, 5).map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopicToConfirm(topic.id)}
                    disabled={creating}
                    className="w-full text-left group flex items-start gap-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 p-4 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-sm font-bold border border-indigo-100">
                      #{topic.numer}
                    </span>
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {topic.pytanie}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Kliknij, aby otworzyć wyzwanie
                      </p>
                    </div>
                    <span className="text-sm font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors self-center shrink-0">
                      Rozwiąż →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : topics.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Wybrane zadania z Języka Polskiego ({topics.length})
                </h2>
                <p className="text-sm text-slate-600">
                  Pytania z lektur szkolnych oraz zadania
                </p>
              </div>

              <Link
                href="/topics"
                className="text-sm font-bold text-slate-900 hover:text-slate-600 inline-flex items-center gap-1 transition-colors"
              >
                Wszystkie zadania →
              </Link>
            </div>

            {topicsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid gap-3">
                {topics.slice(0, 5).map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopicToConfirm(topic.id)}
                    disabled={creating}
                    className="w-full text-left group flex items-start gap-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-amber-50/50 p-4 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-800 font-mono text-sm font-bold border border-amber-200">
                      #{topic.numer}
                    </span>
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {topic.pytanie}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Kliknij, aby otworzyć wyzwanie
                      </p>
                    </div>
                    <span className="text-sm font-bold text-amber-700 group-hover:text-amber-900 transition-colors self-center shrink-0">
                      Rozwiąż →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xs text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl shadow-inner">
              📖
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                Baza zadań z Języka Polskiego jest pusta
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Na razie sekcja Języka Polskiego nie zawiera jeszcze pytań. Wykonaj skrypt SQL, aby dodać pytania do bazy danych!
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveSubject('matematyka')}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span>Przejdź do zadań z Matematyki</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
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
