'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Marked } from 'marked';

interface SessionResult {
  id: string;
  status: 'active' | 'monologue' | 'qa' | 'evaluating' | 'completed' | 'generation_failed' | 'evaluation_failed';
  created_at: string;
  numer: number;
  pytanie: string;
  odpowiedz: string;
  score: number | null;
  is_correct: number | boolean | null;
  feedback: string | null;
}

const marked = new Marked();

export default function ResultsPage() {
  const [sessions, setSessions] = useState<SessionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const completedSessions = sessions.filter(
    (s) => s.status === 'completed' && s.score !== null
  );

  // Analytics calculations
  const totalAttempts = sessions.length;
  const completedCount = completedSessions.length;
  const passedCount = completedSessions.filter((s) => Boolean(s.is_correct)).length;
  
  const avgScore = completedCount > 0
    ? (completedSessions.reduce((acc, s) => acc + (s.score || 0), 0) / completedCount).toFixed(1)
    : '0.0';

  const passRate = completedCount > 0
    ? Math.round((passedCount / completedCount) * 100)
    : 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-8">
        <p className="text-muted-foreground animate-pulse">Ładowanie historii zadań...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 sm:pb-5">
          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Moje wyniki i postępy
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              Historia rozwiązanych zadań matematycznych i analizy AI
            </p>
          </div>
          <Link
            href="/"
            className="self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            ← Strona główna
          </Link>
        </div>

        {/* Analytics Section */}
        {completedCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* KPI 1: Circular average score */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Średnia ocena</span>
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="#f1f5f9"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="#0f172a"
                    strokeWidth="7"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 46}
                    strokeDashoffset={2 * Math.PI * 46 * (1 - Math.min(10, parseFloat(avgScore)) / 10)}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-mono font-bold text-slate-900">{avgScore}</span>
                  <span className="text-[11px] text-slate-400">/ 10 pkt</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Średnia z ukończonych zadań
              </p>
            </div>

            {/* KPI 2: Stats Breakdown */}
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 space-y-4 flex flex-col justify-center shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Podsumowanie</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-0.5">
                  <span className="text-xs text-slate-500 font-medium">Ukończone</span>
                  <p className="text-xl font-bold font-mono text-slate-900">{completedCount} <span className="text-xs font-normal text-slate-400">/ {totalAttempts}</span></p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-0.5">
                  <span className="text-xs text-slate-500 font-medium">Skuteczność</span>
                  <p className="text-xl font-bold font-mono text-slate-900">{passRate}%</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Zaliczone wyzwania</span>
                  <span className="font-mono font-bold text-slate-900">{passedCount} z {completedCount}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${passRate}%` }}
                    className="h-full bg-slate-900 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 text-sm shadow-xs">
            Brak ukończonych zadań do wyliczenia statystyk. Przejdź do zadań, aby sprawdzić swoje rozwiązania!
          </div>
        )}

        {/* History List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Historia zadań
          </h2>

          {sessions.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-6">
              Nie masz jeszcze żadnych zapisanych sesji.
            </p>
          ) : (
            <div className="space-y-2.5">
              {sessions.map((session) => {
                const isExpanded = expandedSession === session.id;
                const formattedDate = new Date(session.created_at).toLocaleString('pl-PL', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const isCompleted = session.status === 'completed';
                const isCorrect = Boolean(session.is_correct);

                return (
                  <div
                    key={session.id}
                    className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 transition-colors"
                  >
                    {/* Header bar of the item */}
                    <div
                      onClick={() => isCompleted && setExpandedSession(isExpanded ? null : session.id)}
                      className={`flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer hover:bg-slate-50/50 select-none ${
                        isCompleted ? '' : 'pointer-events-none opacity-70'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold font-mono bg-slate-100 text-slate-800 border border-slate-200/80">
                            Zadanie #{session.numer}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formattedDate}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm text-slate-900 leading-snug">
                          {session.pytanie}
                        </h3>
                      </div>

                      {/* Score badge or status */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        {isCompleted ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-900">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              />
                              <span>{isCorrect ? 'Zaliczone' : 'Do poprawy'}</span>
                            </span>
                            <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 font-mono text-slate-900 px-2.5 py-0.5 text-xs font-bold">
                              {session.score} / 10 pkt
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                            {session.status === 'active' ||
                            session.status === 'monologue' ||
                            session.status === 'qa' ||
                            session.status === 'evaluating'
                              ? 'W toku'
                              : 'Nieukończona'}
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-slate-400 text-xs font-medium">
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detailed feedback expand box */}
                    {isExpanded && isCompleted && (
                      <div className="border-t border-slate-100 bg-slate-50/60 p-4 sm:p-5 space-y-4">
                        {/* Expected solution */}
                        {session.odpowiedz && (
                          <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Wzorcowa odpowiedź:</span>
                            <p className="text-xs text-slate-700 leading-relaxed italic">{session.odpowiedz}</p>
                          </div>
                        )}

                        {/* Feedback text */}
                        {session.feedback && (
                          <div className="space-y-1.5">
                            <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Komentarz i ocena AI:</h4>
                            <div 
                              className="prose prose-slate prose-xs max-w-none text-slate-700 leading-relaxed space-y-1.5 font-normal"
                              dangerouslySetInnerHTML={{
                                __html: marked.parse(session.feedback) as string,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
