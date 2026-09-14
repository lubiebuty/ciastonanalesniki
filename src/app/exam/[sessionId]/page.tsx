'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AudioRecorder from '@/components/AudioRecorder';
import ScoreBreakdown from '@/components/ScoreBreakdown';

type ExamPhase = 'monologue' | 'evaluating' | 'report';

interface Scores {
  is_correct: boolean;
  score: number;
}

interface Topic {
  numer: number;
  pytanie: string;
  odpowiedz: string;
  przedmiot: string;
}

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [phase, setPhase] = useState<ExamPhase>('monologue');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [scores, setScores] = useState<Scores | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [recorderStatus, setRecorderStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [answerText, setAnswerText] = useState<string>('');

  // Load session & topic details on mount
  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Nie udało się załadować szczegółów sesji');
        return res.json();
      })
      .then((data) => {
        if (data.session) {
          const subject = data.session.przedmiot || (data.session.numer >= 51 ? 'polski' : 'matematyka');
          setTopic({
            numer: data.session.numer,
            pytanie: data.session.pytanie,
            odpowiedz: data.session.odpowiedz,
            przedmiot: subject,
          });
          if (typeof window !== 'undefined' && subject) {
            localStorage.setItem('selected_przedmiot', subject);
          }
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [sessionId]);

  // Handle transcribed text chunks from the recorder
  const handleTranscript = useCallback((text: string) => {
    setAnswerText((prev) => prev + (prev ? ' ' : '') + text);
  }, []);

  // Finish answer → evaluate
  const finishExam = useCallback(async () => {
    setPhase('evaluating');
    setError(null);

    // Save final transcribed text to the database first
    try {
      await fetch(`/api/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: sessionId, // Using sessionId as a fallback or general answer id
          answerText: answerText,
        }),
      });
    } catch {
      // Ignored for now, since evaluate reads chunks directly
    }

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();

      if (res.ok && data.scores) {
        setScores(data.scores);
        setFeedback(data.feedback || '');
        setPhase('report');
      } else {
        setError(data.error || 'Błąd ewaluacji');
        setPhase('monologue');
      }
    } catch {
      setError('Błąd połączenia podczas ewaluacji');
      setPhase('monologue');
    }
  }, [sessionId, answerText]);

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 shadow-xs"
          >
            {error}
          </div>
        )}

        {/* Selected Topic Question Banner */}
        {topic && (phase === 'monologue') && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-2 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold font-mono bg-slate-900 text-white">
                Zadanie #{topic.numer}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Pytanie egzaminacyjne
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {topic.pytanie}
            </p>
          </div>
        )}

        {/* Phase: Monologue / Answer input */}
        {phase === 'monologue' && (
          <div className="space-y-5 sm:space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-5 shadow-xs">
              <div className="space-y-0.5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Twoja odpowiedź
                </h2>
                <p className="text-xs text-slate-500">
                  Wypowiedz swoje rozwiązanie do mikrofonu lub wpisz je poniżej.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <AudioRecorder
                  sessionId={sessionId}
                  phase="monologue"
                  onTranscript={handleTranscript}
                  onStatusChange={setRecorderStatus}
                  isActive={true}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="user-answer-text" className="text-xs font-semibold text-slate-700 block">
                  Edycja odpowiedzi (opcjonalnie):
                </label>
                <textarea
                  id="user-answer-text"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Tutaj pojawi się transkrypcja mowy lub możesz wpisać swoje rozwiązanie ręcznie..."
                  className="w-full h-32 p-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium text-sm leading-relaxed transition-colors shadow-2xs"
                />
              </div>

              <button
                onClick={finishExam}
                disabled={recorderStatus === 'recording' || recorderStatus === 'processing'}
                className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white p-3.5 font-bold text-sm shadow-xs transition-colors active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sprawdź i oceń moje rozwiązanie ✨</span>
              </button>
            </div>
          </div>
        )}

        {/* Phase: Evaluating */}
        {phase === 'evaluating' && (
          <div className="text-center space-y-4 py-16 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Analiza odpowiedzi przez model AI...</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Sprawdzamy poprawność toku myślenia, pojęć i ostatecznego wyniku.
              </p>
            </div>
          </div>
        )}

        {/* Phase: Report */}
        {phase === 'report' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Twój wynik
              </h1>
            </div>

            {scores && <ScoreBreakdown scores={scores} feedback={feedback} />}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  const subject = topic?.przedmiot || (typeof window !== 'undefined' ? localStorage.getItem('selected_przedmiot') : null) || 'matematyka';
                  router.push(`/topics?przedmiot=${subject}`);
                }}
                className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white p-3.5 font-semibold text-xs shadow-xs transition-colors active:scale-[0.99] cursor-pointer"
              >
                Kolejne zadanie ✨
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 p-3.5 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                Strona główna
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
