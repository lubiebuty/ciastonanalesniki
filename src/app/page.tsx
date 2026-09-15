'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface TopicData {
  id: string;
  numer: number;
  pytanie: string;
  odpowiedz: string;
  przedmiot?: string;
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
    <main className="min-h-screen p-3 sm:p-6 md:p-10 font-sketch">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">

        {/* ═════════════════════════════════════════════════════════════════
            1. WYBIERZ PRZEDMIOT (Subject Selection Tabs)
            ═════════════════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-1.5">
            <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-wider text-slate-900">
              Wybierz przedmiot
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Matematyka Card */}
            <button
              type="button"
              onClick={() => setActiveSubject('matematyka')}
              className={`p-4 sm:p-5 rounded-xl border-[2.5px] border-slate-900 text-left transition-all cursor-pointer ${
                activeSubject === 'matematyka'
                  ? 'bg-amber-100/70 shadow-[5px_5px_0px_#0f172a] scale-[1.01]'
                  : 'bg-white hover:bg-slate-50 shadow-[3px_3px_0px_#0f172a]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl border-2 border-slate-900 bg-white flex items-center justify-center shadow-[2px_2px_0px_#0f172a]">
                  <svg className="w-6 h-6 stroke-slate-900 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.3 15.3l-9-9a2 2 0 0 0-2.8 0l-5.2 5.2a2 2 0 0 0 0 2.8l9 9a2 2 0 0 0 2.8 0l5.2-5.2a2 2 0 0 0 0-2.8z"/>
                    <path d="m14.5 12.5 2-2"/>
                    <path d="m11.5 9.5 2-2"/>
                    <path d="m8.5 6.5 2-2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xl tracking-wide">Matematyka</h3>
                  <p className="text-sm font-bold text-slate-600">Cyferki, równania i geometria</p>
                </div>
              </div>
            </button>

            {/* Język Polski Card */}
            <button
              type="button"
              onClick={() => setActiveSubject('polski')}
              className={`p-4 sm:p-5 rounded-xl border-[2.5px] border-slate-900 text-left transition-all cursor-pointer ${
                activeSubject === 'polski'
                  ? 'bg-amber-100/70 shadow-[5px_5px_0px_#0f172a] scale-[1.01]'
                  : 'bg-white hover:bg-slate-50 shadow-[3px_3px_0px_#0f172a]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl border-2 border-slate-900 bg-white flex items-center justify-center shadow-[2px_2px_0px_#0f172a]">
                  <svg className="w-6 h-6 stroke-slate-900 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                    <path d="M6 6h10"/>
                    <path d="M6 10h10"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xl tracking-wide">Język Polski</h3>
                  <p className="text-sm font-bold text-slate-600">Lektury, pojęcia i wypracowania</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            4. HERO CALL TO ACTION (Notebook Styled Banner)
            ═════════════════════════════════════════════════════════════════ */}
        {activeSubject === 'matematyka' ? (
          <div className="sketch-box p-6 sm:p-8 bg-white space-y-4">
            <div className="inline-block px-3 py-1 rounded-md border-2 border-slate-900 bg-amber-200 font-extrabold text-xs uppercase tracking-wider text-slate-900 shadow-[2px_2px_0px_#0f172a]">
              Tutor Matematyczny
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-wide leading-tight text-slate-900">
              Opanuj matematykę z natychmiastową oceną AI
            </h2>

            <p className="text-base sm:text-lg font-bold text-slate-600 leading-relaxed max-w-2xl">
              Wybierz zadanie, odpowiedz głosem lub wpisz rozwiązanie, a sztuczna inteligencja sprawdzi Twój tok myślenia i podpowie jak zdobyć 10/10 punktów!
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <Link
                href="/topics?przedmiot=matematyka"
                id="btn-start-simulation"
                className="sketch-btn-black px-6 py-3.5 text-base sm:text-lg font-extrabold text-center inline-flex items-center justify-center gap-2"
              >
                <span>Wybierz zadanie</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/results"
                id="btn-view-results"
                className="sketch-btn px-5 py-3.5 text-base sm:text-lg font-extrabold text-center inline-flex items-center justify-center gap-2"
              >
                <span>Moje wyniki</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="sketch-box p-6 sm:p-8 bg-white space-y-4">
            <div className="inline-block px-3 py-1 rounded-md border-2 border-slate-900 bg-amber-200 font-extrabold text-xs uppercase tracking-wider text-slate-900 shadow-[2px_2px_0px_#0f172a]">
              Trening Polonistyczny
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-wide leading-tight text-slate-900">
              Trening zadań z Polskiego
            </h2>

            <p className="text-base sm:text-lg font-bold text-slate-600 leading-relaxed max-w-2xl">
              Ćwicz zadania z języka polskiego, analizuj lektury i sprawdzaj swoją wiedzę z automatyczną oceną AI!
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <Link
                href="/topics?przedmiot=polski"
                className="sketch-btn-black px-6 py-3.5 text-base sm:text-lg font-extrabold text-center inline-flex items-center justify-center gap-2"
              >
                <span>Wybierz zadanie</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/results"
                className="sketch-btn px-5 py-3.5 text-base sm:text-lg font-extrabold text-center inline-flex items-center justify-center gap-2"
              >
                <span>Moje wyniki</span>
              </Link>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            5. TOPICS LIST PREVIEW (Pages 7 & 8 Hatch Patterned Tiles)
            ═════════════════════════════════════════════════════════════════ */}
        {activeSubject === 'matematyka' ? (
          <div className="sketch-box p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-slate-900">
                  Wybrane zadania z matematyki ({topics.length})
                </h2>
                <p className="text-sm font-bold text-slate-500">
                  Wybierz kafelek z listy poniżej:
                </p>
              </div>

              <Link
                href="/topics?przedmiot=matematyka"
                className="sketch-btn px-3.5 py-1 text-sm font-extrabold hover:bg-amber-50"
              >
                Wszystkie zadania →
              </Link>
            </div>

            {topicsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-3 border-slate-900 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : topics.length === 0 ? (
              <p className="text-slate-600 text-base py-4 font-bold">Brak zadań z matematyki w bazie danych.</p>
            ) : (
              <div className="grid gap-3">
                {topics.slice(0, 5).map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopicToConfirm(topic.id)}
                    disabled={creating}
                    className="w-full text-left group flex items-start gap-3.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-amber-50/70 p-4 transition-all shadow-[3px_3px_0px_#0f172a] hover:shadow-[4px_4px_0px_#0f172a] cursor-pointer disabled:opacity-50"
                  >
                    <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-slate-900 bg-amber-100 text-slate-900 font-extrabold text-base shadow-[1px_1px_0px_#0f172a]">
                      #{topic.numer}
                    </span>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {topic.pytanie}
                      </p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Kliknij, aby otworzyć zadanie
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900 group-hover:translate-x-1 transition-transform self-center shrink-0">
                      Rozwiąż →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : topics.length > 0 ? (
          <div className="sketch-box p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-slate-900">
                  Wybrane zadania z Języka Polskiego ({topics.length})
                </h2>
                <p className="text-sm font-bold text-slate-500">
                  Pytania z lektur oraz pojęcia literackie:
                </p>
              </div>

              <Link
                href="/topics?przedmiot=polski"
                className="sketch-btn px-3.5 py-1 text-sm font-extrabold hover:bg-amber-50"
              >
                Wszystkie zadania →
              </Link>
            </div>

            {topicsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-3 border-slate-900 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid gap-3">
                {topics.slice(0, 5).map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopicToConfirm(topic.id)}
                    disabled={creating}
                    className="w-full text-left group flex items-start gap-3.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-amber-50/70 p-4 transition-all shadow-[3px_3px_0px_#0f172a] hover:shadow-[4px_4px_0px_#0f172a] cursor-pointer disabled:opacity-50"
                  >
                    <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-slate-900 bg-amber-100 text-slate-900 font-extrabold text-base shadow-[1px_1px_0px_#0f172a]">
                      #{topic.numer}
                    </span>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {topic.pytanie}
                      </p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Kliknij, aby otworzyć zadanie
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-slate-900 group-hover:translate-x-1 transition-transform self-center shrink-0">
                      Rozwiąż →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="sketch-box p-8 sm:p-12 text-center space-y-4">
            <div className="flex justify-center">
              <svg className="w-14 h-14 stroke-slate-900 fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                <path d="M6 6h10"/>
                <path d="M6 10h10"/>
                <path d="M6 14h6"/>
              </svg>
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Baza zadań z Języka Polskiego jest pusta
              </h2>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                Na razie sekcja Języka Polskiego nie zawiera jeszcze pytań w tym środowisku.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveSubject('matematyka')}
                className="sketch-btn-black px-6 py-2.5 text-sm font-extrabold"
              >
                <span>Przejdź do zadań z Matematyki →</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          CONFIRMATION MODAL (Wimpy Kid Notebook Memo Style)
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
                    Zadanie #{topic.numer}
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
                  <li>Nagraj wypowiedź głosem lub wpisz rozwiązanie tekstem.</li>
                  <li>Model AI oceni merytorykę i tok rozumowania.</li>
                  <li>Otrzymasz punktację 0–10 oraz wskazówki krok po kroku.</li>
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
    </main>
  );
}
