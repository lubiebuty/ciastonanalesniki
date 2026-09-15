'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AudioRecorder from '@/components/AudioRecorder';
import ScoreBreakdown from '@/components/ScoreBreakdown';
import ChalkboardFrame from '@/components/sketch/ChalkboardFrame';
import WimpyCharacters from '@/components/sketch/WimpyCharacters';
import WimpyRobot from '@/components/sketch/WimpyRobot';
import NoTokensModal from '@/components/NoTokensModal';
import { getNextTopic } from '@/lib/geografia';

type ExamPhase = 'monologue' | 'evaluating' | 'report';

interface Scores {
  is_correct: boolean;
  score: number;
}

interface Topic {
  topicId?: string;
  numer: number;
  pytanie: string;
  odpowiedz: string;
  przedmiot: string;
  dzial_numer?: number;
  dzial_nazwa?: string;
  wariant?: string;
  numer_pytania?: number;
  notatka?: string | null;
  id_slug?: string;
}

function ExamContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const { data: session, update } = useSession();

  const prevScoreParam = searchParams.get('prevScore');
  const prevScore = prevScoreParam !== null && !isNaN(Number(prevScoreParam)) ? Number(prevScoreParam) : null;

  const [phase, setPhase] = useState<ExamPhase>('monologue');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [scores, setScores] = useState<Scores | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [recorderStatus, setRecorderStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [answerText, setAnswerText] = useState<string>('');
  const [showKeyboard, setShowKeyboard] = useState<boolean>(false);
  const [repeating, setRepeating] = useState<boolean>(false);
  const [showNoTokensModal, setShowNoTokensModal] = useState<boolean>(false);

  // Load session & topic details on mount
  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Nie udało się załadować szczegółów sesji');
        return res.json();
      })
      .then((data) => {
        if (data.session) {
          const subject =
            data.session.przedmiot ||
            (data.session.numer >= 201 ? 'geografia' : data.session.numer >= 51 ? 'polski' : 'matematyka');
          setTopic({
            topicId: data.session.topic_id,
            numer: data.session.numer,
            pytanie: data.session.pytanie,
            odpowiedz: data.session.odpowiedz,
            przedmiot: subject,
            dzial_numer: data.session.dzial_numer,
            dzial_nazwa: data.session.dzial_nazwa,
            wariant: data.session.wariant,
            numer_pytania: data.session.numer_pytania,
            notatka: data.session.notatka,
            id_slug: data.session.id_slug,
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
          questionId: sessionId,
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

      if (res.status === 402 || data.error?.toLowerCase().includes('token')) {
        setShowNoTokensModal(true);
        setPhase('monologue');
        return;
      }

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

  // Repeat answer → creates a new session entry (non-overwriting)
  const repeatExam = async () => {
    if (!topic?.topicId || repeating) return;

    if ((session?.tokens ?? 0) <= 0) {
      setShowNoTokensModal(true);
      return;
    }

    setRepeating(true);

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: topic.topicId }),
      });

      const data = await res.json();

      if (res.status === 402 || data.error?.toLowerCase().includes('token')) {
        setShowNoTokensModal(true);
        return;
      }

      if (res.ok && data.session) {
        await update();
        const currentScore = scores?.score ?? 0;
        router.push(`/exam/${data.session.id}?prevScore=${currentScore}`);
      } else {
        alert(data.error || 'Nie udało się rozpocząć nowej próby zadania');
      }
    } catch {
      alert('Błąd połączenia z serwerem');
    } finally {
      setRepeating(false);
    }
  };

  const [loadingNext, setLoadingNext] = useState<boolean>(false);

  // Next topic in learning sequence → creates a new session and starts exam immediately
  const handleNextExamTopic = async () => {
    if (loadingNext || !topic) return;

    if ((session?.tokens ?? 0) <= 0) {
      setShowNoTokensModal(true);
      return;
    }

    setLoadingNext(true);

    try {
      const subject = topic.przedmiot || 'geografia';
      const [topicsRes, sessionsRes] = await Promise.all([
        fetch(`/api/topics?przedmiot=${subject}`),
        fetch('/api/sessions'),
      ]);

      const topicsData = await topicsRes.json();
      const sessionsData = await sessionsRes.json();

      const allTopics = topicsData.topics || [];
      const allSessions = sessionsData.sessions || [];

      const nextTopic = getNextTopic(allTopics, allSessions, topic.numer ?? topic.topicId, subject);

      if (nextTopic && nextTopic.id) {
        const createRes = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topicId: nextTopic.id }),
        });

        const createData = await createRes.json();

        if (createRes.status === 402 || createData.error?.toLowerCase().includes('token')) {
          setShowNoTokensModal(true);
          return;
        }

        if (createRes.ok && createData.session) {
          await update();
          router.push(`/exam/${createData.session.id}`);
          return;
        }
      }

      router.push(`/topics?przedmiot=${subject}`);
    } catch {
      router.push(`/topics?przedmiot=${topic.przedmiot || 'matematyka'}`);
    } finally {
      setLoadingNext(false);
    }
  };

  return (
    <main className="min-h-screen p-3 sm:p-6 md:p-10 font-sketch">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        {error && (
          <div
            role="alert"
            className="rounded-xl border-[2.5px] border-slate-900 bg-rose-50 p-4 text-sm font-extrabold text-rose-900 shadow-[4px_4px_0px_#0f172a]"
          >
            {error}
          </div>
        )}

        {/* Top navigation link */}
        <div className="flex items-center justify-between">
          <Link
            href={topic?.przedmiot ? `/topics?przedmiot=${topic.przedmiot}` : '/topics'}
            className="sketch-btn px-4 py-2 text-sm font-extrabold"
          >
            ← Wróć do listy zadań
          </Link>

          {topic && (
            <div className="flex items-center gap-2">
              {topic.wariant && (
                <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-md border-2 border-slate-900 bg-amber-200 shadow-[1.5px_1.5px_0px_#0f172a]">
                  Wariant {topic.wariant}
                </span>
              )}
              <span className="text-sm font-extrabold uppercase px-3 py-1 rounded-md border-2 border-slate-900 bg-amber-100 shadow-[2px_2px_0px_#0f172a]">
                {topic.przedmiot === 'polski'
                  ? 'Język Polski'
                  : topic.przedmiot === 'geografia'
                  ? 'Geografia'
                  : 'Matematyka'}
              </span>
            </div>
          )}
        </div>

        {/* Previous attempt indicator banner during solving */}
        {phase === 'monologue' && prevScore !== null && (
          <div className="rounded-xl border-2 border-dashed border-amber-500 bg-amber-50/80 p-3.5 text-center space-y-0.5 shadow-[2px_2px_0px_#0f172a] animate-in fade-in duration-150">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Nowa próba tego zadania
            </span>
            <p className="text-sm sm:text-base font-bold text-slate-900">
              W poprzedniej próbie Twój wynik wyniósł: <strong>{prevScore} / 10 pkt</strong>. Zobaczmy, czy uda Ci się poprawić odpowiedź i zrozumienie!
            </p>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            PHASE: MONOLOGUE / QUESTION SOLVING (Pages 4, 5, 6)
            ═════════════════════════════════════════════════════════════════ */}
        {phase === 'monologue' && topic && (
          <div className="space-y-6 sm:space-y-8">
            {/* Visual Scene: Chalkboard Frame with question + Characters */}
            <div className="relative">
              <ChalkboardFrame
                title={
                  topic.dzial_nazwa
                    ? `${topic.dzial_nazwa} • Wariant ${topic.wariant || ''}`
                    : `ZADANIE #${topic.numer}`
                }
              >
                <div className="space-y-3">
                  {topic.wariant === 'D' && (
                    <div className="p-2.5 rounded-lg border-2 border-dashed border-sky-600 bg-sky-50 text-xs font-bold text-sky-950">
                      Zadanie typu „Znajdź i wytłumacz błąd”: Oceń, czy w podanym zdaniu występuje błąd merytoryczny i go wytłumacz. Pamiętaj: zdanie może być w pełni poprawne — nie doszukuj się błędu na siłę!
                    </div>
                  )}

                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                    {topic.pytanie}
                  </p>

                  <div className="pt-2 border-t-2 border-dashed border-slate-300 flex items-center justify-between text-xs sm:text-sm font-extrabold text-slate-500 uppercase tracking-wider">
                    <span>{topic.id_slug ? `KOD: ${topic.id_slug}` : 'SPRAWDŹ CZY ROZUMIESZ'}</span>
                    <span>10 PKT</span>
                  </div>
                </div>
              </ChalkboardFrame>

              {/* Characters observing the board */}
              <div className="flex justify-end -mt-3 sm:-mt-6 pr-4 relative z-20 pointer-events-none">
                <WimpyCharacters pose="looking_up" />
              </div>
            </div>

            {/* Answer Box: Microphone + Optional Keyboard Toggle */}
            <div className="sketch-box p-5 sm:p-7 space-y-5 bg-white">
              <div className="text-center space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide uppercase text-slate-900">
                  Twoja odpowiedź
                </h2>
                <p className="text-sm font-bold text-slate-600">
                  Naciśnij przycisk i wypowiedz swoje rozwiązanie lub wpisz je poniżej.
                </p>
              </div>

              {/* Hand-drawn Audio Recorder */}
              <div className="py-2">
                <AudioRecorder
                  sessionId={sessionId}
                  phase="monologue"
                  onTranscript={handleTranscript}
                  onStatusChange={setRecorderStatus}
                  isActive={true}
                />
              </div>

              {/* Toggle text input / keyboard */}
              <div className="flex items-center justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  className="sketch-btn px-4 py-1.5 text-xs sm:text-sm font-extrabold inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4 stroke-slate-900 fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="6" x2="6.01" y1="9" y2="9" />
                    <line x1="10" x2="10.01" y1="9" y2="9" />
                    <line x1="14" x2="14.01" y1="9" y2="9" />
                    <line x1="18" x2="18.01" y1="9" y2="9" />
                    <line x1="8" x2="16" y1="13" y2="13" />
                  </svg>
                  <span>{showKeyboard ? 'Ukryj pole tekstowe' : 'Wpisz lub edytuj odpowiedź ręcznie'}</span>
                </button>
              </div>

              {/* Textarea for manual input or edit */}
              {showKeyboard && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label htmlFor="user-answer-text" className="text-xs font-extrabold uppercase tracking-wide text-slate-700 block">
                    Twoje rozwiązanie (tekst):
                  </label>
                  <textarea
                    id="user-answer-text"
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Wpisz swoje rozwiązanie lub edytuj słowa zarejestrowane przez mikrofon..."
                    className="w-full h-36 p-4 rounded-xl border-2 border-slate-900 bg-amber-50/20 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-sketch text-base leading-relaxed shadow-[3px_3px_0px_#0f172a]"
                  />
                </div>
              )}

              {/* Submit / Finish Button */}
              <button
                type="button"
                onClick={finishExam}
                disabled={recorderStatus === 'recording' || recorderStatus === 'processing'}
                className="w-full sketch-btn-black p-4 font-extrabold text-base sm:text-xl tracking-wide flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer shadow-[5px_5px_0px_#0f172a]"
              >
                <span>Sprawdź i oceń moje rozwiązanie</span>
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            PHASE: EVALUATING (Bob the Robot Analyzing)
            ═════════════════════════════════════════════════════════════════ */}
        {phase === 'evaluating' && (
          <div className="sketch-box p-8 sm:p-14 text-center space-y-6 bg-white">
            <WimpyRobot message="AI BOB SPRAWDZA TWÓJ TOK ROZUMOWANIA... CZEKAJ NA OCENĘ!" />
            <div className="flex items-center justify-center gap-2 pt-4">
              <div className="w-8 h-8 border-3 border-slate-900 border-t-amber-500 rounded-full animate-spin" />
              <span className="font-extrabold text-base uppercase tracking-wider text-slate-700">
                Przetwarzanie odpowiedzi...
              </span>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            PHASE: REPORT / RESULTS
            ═════════════════════════════════════════════════════════════════ */}
        {phase === 'report' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-slate-900 uppercase">
                Twój Wynik
              </h1>
            </div>

            {/* Score Comparison Banner when repeating an answer */}
            {prevScore !== null && scores && (
              <div
                className={`rounded-xl border-[2.5px] p-4 sm:p-5 text-center space-y-1.5 shadow-[3px_3px_0px_#0f172a] animate-in fade-in duration-200 ${
                  scores.score > prevScore
                    ? 'border-emerald-900 bg-emerald-50 text-emerald-950'
                    : scores.score < prevScore
                    ? 'border-rose-900 bg-rose-50 text-rose-950'
                    : 'border-slate-900 bg-amber-50 text-slate-900'
                }`}
              >
                <span className="text-xs font-extrabold uppercase tracking-wider block opacity-80">
                  Porównanie z poprzednią próbą
                </span>
                <div className="text-base sm:text-lg font-extrabold">
                  {scores.score > prevScore && (
                    <p>
                      Postęp! Twój wynik wzrósł z {prevScore}/10 do {scores.score}/10 pkt (+{scores.score - prevScore} pkt). Lepsze zrozumienie tematu!
                    </p>
                  )}
                  {scores.score === prevScore && (
                    <p>
                      Wynik bez zmian: {scores.score}/10 pkt. Zwróć uwagę na uwagi AI, aby dopracować szczegóły.
                    </p>
                  )}
                  {scores.score < prevScore && (
                    <p>
                      Wynik w tej próbie ({scores.score}/10 pkt) jest niższy niż poprzedni ({prevScore}/10 pkt). Sprawdź uwagi poniżej i powtórz trudniejsze pojęcia.
                    </p>
                  )}
                </div>
              </div>
            )}

            {scores && <ScoreBreakdown scores={scores} feedback={feedback} />}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={repeatExam}
                disabled={repeating}
                className="flex-1 sketch-btn bg-amber-200 hover:bg-amber-300 p-4 font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#0f172a]"
              >
                {repeating ? (
                  <span>Tworzenie nowej próby...</span>
                ) : (
                  <span>Powtórz odpowiedź</span>
                )}
              </button>
              <button
                type="button"
                onClick={handleNextExamTopic}
                disabled={loadingNext}
                className="flex-1 sketch-btn-black p-4 font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#0f172a] disabled:opacity-50"
              >
                {loadingNext ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Ładowanie zadania...</span>
                  </>
                ) : (
                  <span>Kolejne zadanie →</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 sketch-btn p-4 font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#0f172a]"
              >
                Strona główna
              </button>
            </div>
          </div>
        )}
      </div>

      {/* No Tokens Modal Window */}
      <NoTokensModal
        isOpen={showNoTokensModal}
        onClose={() => setShowNoTokensModal(false)}
      />
    </main>
  );
}

export default function ExamPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center p-8 font-sketch">
          <p className="text-xl font-bold animate-pulse text-slate-900">Ładowanie zadania...</p>
        </main>
      }
    >
      <ExamContent />
    </Suspense>
  );
}
