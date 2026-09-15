'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ScoreBreakdown from '@/components/ScoreBreakdown';

interface Topic {
  id: string;
  numer: number;
  pytanie: string;
  odpowiedz: string;
}

interface Scores {
  is_correct: boolean | number;
  score: number;
}

interface EvaluationResult {
  scores: Scores;
  feedback: string;
}

export default function SandboxPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/topics')
      .then((res) => res.json())
      .then((data) => {
        const list = data.topics || [];
        setTopics(list);
        if (list.length > 0) {
          setSelectedTopicId(list[0].id);
        }
      })
      .catch(() => setError('Nie udało się załadować listy tematów.'));
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/sandbox/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: selectedTopicId,
          userAnswer,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ewaluacja zakończyła się błędem');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd komunikacji');
    } finally {
      setLoading(false);
    }
  };

  const loadScenario = (type: 'correct' | 'partial' | 'wrong') => {
    const activeTopic = topics.find((t) => t.id === selectedTopicId);
    if (!activeTopic) return;

    if (type === 'correct') {
      setUserAnswer(activeTopic.odpowiedz);
    } else if (type === 'partial') {
      setUserAnswer(
        `Wydaje mi się, że to zadanie można rozwiązać tak: robimy to intuicyjnie i wychodzi podobny wynik, ale nie jestem pewien dokładnego dowodu matematycznego ani definicji.`
      );
    } else if (type === 'wrong') {
      setUserAnswer('To zadanie jest zbyt trudne, nie wiem jak to zrobić. 2 + 2 = 5.');
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 sm:pb-5">
          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Piaskownica Ewaluacji (LLM)
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              Przetestuj ocenę odpowiedzi tekstowych z gotowymi scenariuszami
            </p>
          </div>
          <Link
            href="/"
            className="self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            ← Strona główna
          </Link>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-white p-4 text-xs font-semibold text-red-700 shadow-xs">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form Side */}
          <div className="space-y-5">
            {/* Select Topic */}
            <div className="space-y-1.5">
              <label htmlFor="topic-select" className="text-xs font-semibold text-slate-700 block">
                Wybierz zadanie:
              </label>
              {topics.length === 0 ? (
                <p className="text-xs text-slate-400">Ładowanie tematów...</p>
              ) : (
                <select
                  id="topic-select"
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 shadow-2xs focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors cursor-pointer"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      Zadanie #{t.numer} — {t.pytanie.slice(0, 60)}...
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Scenarios Quick Load */}
            {selectedTopicId && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                <h2 className="text-xs font-semibold text-slate-700">
                  Wklej gotowy scenariusz:
                </h2>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => loadScenario('correct')}
                    className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Wzorcowa (10/10)</span>
                  </button>
                  <button
                    onClick={() => loadScenario('partial')}
                    className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Częściowo poprawna</span>
                  </button>
                  <button
                    onClick={() => loadScenario('wrong')}
                    className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Błędna odpowiedź</span>
                  </button>
                </div>
              </div>
            )}

            {/* Expected Answer Display */}
            {selectedTopicId && (() => {
              const activeTopic = topics.find((t) => t.id === selectedTopicId);
              return activeTopic ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Pytanie i wzorzec:
                  </span>
                  <p className="text-xs font-bold text-slate-900 leading-snug">{activeTopic.pytanie}</p>
                  <p className="text-xs text-slate-600 italic leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    {activeTopic.odpowiedz}
                  </p>
                </div>
              ) : null;
            })()}

            {/* Answer Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="user-answer-text" className="text-xs font-semibold text-slate-700">
                  Odpowiedź ucznia:
                </label>
                <span className="text-xs text-slate-400">{userAnswer.length} znaków</span>
              </div>
              <textarea
                id="user-answer-text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Wpisz lub wklej tutaj odpowiedź..."
                rows={6}
                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-y transition-colors leading-relaxed shadow-2xs"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleEvaluate}
              disabled={loading || !selectedTopicId || !userAnswer.trim()}
              className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white p-3.5 font-bold text-xs shadow-xs disabled:opacity-50 active:scale-[0.99] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Trwa analiza LLM...</span>
                </>
              ) : (
                <span>Uruchom ewaluację testową</span>
              )}
            </button>
          </div>

          {/* Results Side */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 min-h-[380px] flex flex-col justify-center shadow-xs">
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center text-center py-12 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900">Brak wyników</h3>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Wprowadź odpowiedź i uruchom ewaluację, aby zobaczyć ocenę.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                  <h3 className="text-sm font-bold text-slate-900">Generowanie oceny...</h3>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Model ocenia tok myślenia i zgodność z wzorcem.
                  </p>
                </div>
              )}

              {result && !loading && (
                <ScoreBreakdown scores={result.scores} feedback={result.feedback} />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
