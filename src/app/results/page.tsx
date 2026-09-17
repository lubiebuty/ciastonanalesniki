'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { marked } from 'marked';
import NoTokensModal from '@/components/NoTokensModal';

interface SessionItem {
  id: string;
  status: string;
  created_at: string;
  topic_id?: string;
  numer?: number;
  pytanie?: string;
  odpowiedz?: string;
  przedmiot?: string;
  is_correct?: boolean | number;
  score?: number;
  feedback?: string | null;
}

interface AttemptItem {
  id: string;
  attemptNumber: number;
  created_at: string;
  status: string;
  score?: number;
  is_correct?: boolean | number;
  feedback?: string | null;
  scoreDiff: number | null;
}

interface QuestionGroup {
  key: string;
  topic_id?: string;
  numer?: number;
  pytanie: string;
  odpowiedz?: string;
  przedmiot?: string;
  attempts: AttemptItem[];
  latestAttempt: AttemptItem;
  firstAttempt?: AttemptItem;
  totalAttempts: number;
  completedAttemptsCount: number;
  latestScore?: number;
  latestIsCorrect?: boolean;
  overallScoreDiff: number | null;
  lastAttemptDate: string;
}

function formatAttemptsCount(count: number): string {
  if (count === 1) return '1 próba';
  if (count >= 2 && count <= 4) return `${count} próby`;
  return `${count} prób`;
}

function groupSessionsByQuestion(sessions: SessionItem[]): QuestionGroup[] {
  const map = new Map<string, SessionItem[]>();

  for (const session of sessions) {
    const key = session.numer
      ? `num-${session.numer}`
      : session.topic_id
      ? `topic-${session.topic_id}`
      : `session-${session.id}`;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(session);
  }

  const groups: QuestionGroup[] = [];

  for (const [key, groupSessions] of map.entries()) {
    // Sort chronologically ascending (oldest first)
    const sorted = [...groupSessions].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let prevScore: number | null = null;
    const attempts: AttemptItem[] = sorted.map((s, idx) => {
      let scoreDiff: number | null = null;
      if (s.score !== undefined && prevScore !== null) {
        scoreDiff = s.score - prevScore;
      }
      if (s.score !== undefined) {
        prevScore = s.score;
      }

      return {
        id: s.id,
        attemptNumber: idx + 1,
        created_at: s.created_at,
        status: s.status,
        score: s.score,
        is_correct: s.is_correct,
        feedback: s.feedback,
        scoreDiff,
      };
    });

    const completedAttempts = attempts.filter((a) => a.status === 'completed' && a.score !== undefined);
    const latestAttempt = attempts[attempts.length - 1];
    const latestCompleted = completedAttempts.length > 0 ? completedAttempts[completedAttempts.length - 1] : undefined;
    const firstCompleted = completedAttempts.length > 0 ? completedAttempts[0] : undefined;

    let overallScoreDiff: number | null = null;
    if (
      completedAttempts.length > 1 &&
      latestCompleted?.score !== undefined &&
      firstCompleted?.score !== undefined
    ) {
      overallScoreDiff = latestCompleted.score - firstCompleted.score;
    }

    const representative = sorted[sorted.length - 1];
    const subject =
      representative.przedmiot ||
      (representative.numer && representative.numer >= 501
        ? 'chemia'
        : representative.numer && representative.numer >= 201
        ? 'geografia'
        : representative.numer && representative.numer >= 51
        ? 'polski'
        : 'matematyka');

    groups.push({
      key,
      topic_id: representative.topic_id,
      numer: representative.numer,
      pytanie: representative.pytanie || `Zadanie #${representative.numer || '?'}`,
      odpowiedz: representative.odpowiedz,
      przedmiot: subject,
      attempts,
      latestAttempt,
      firstAttempt: firstCompleted,
      totalAttempts: attempts.length,
      completedAttemptsCount: completedAttempts.length,
      latestScore: latestCompleted?.score,
      latestIsCorrect: latestCompleted ? Boolean(latestCompleted.is_correct) : undefined,
      overallScoreDiff,
      lastAttemptDate: latestAttempt.created_at,
    });
  }

  // Sort groups: most recently attempted question first
  groups.sort((a, b) => new Date(b.lastAttemptDate).getTime() - new Date(a.lastAttemptDate).getTime());

  return groups;
}

type SubjectFilter = 'all' | 'matematyka' | 'polski' | 'geografia' | 'chemia';

export default function ResultsPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilter>('all');
  const [expandedQuestionKey, setExpandedQuestionKey] = useState<string | null>(null);
  const [repeatingTopicId, setRepeatingTopicId] = useState<string | null>(null);
  const [showNoTokensModal, setShowNoTokensModal] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const questionGroups = groupSessionsByQuestion(sessions);

  const counts = {
    all: questionGroups.length,
    matematyka: questionGroups.filter((g) => g.przedmiot === 'matematyka').length,
    polski: questionGroups.filter((g) => g.przedmiot === 'polski').length,
    geografia: questionGroups.filter((g) => g.przedmiot === 'geografia').length,
    chemia: questionGroups.filter((g) => g.przedmiot === 'chemia').length,
  };

  const filteredGroups =
    selectedSubject === 'all'
      ? questionGroups
      : questionGroups.filter((g) => g.przedmiot === selectedSubject);

  const completedGroups = filteredGroups.filter((g) => g.latestScore !== undefined);
  const totalQuestionsCount = filteredGroups.length;
  const completedQuestionsCount = completedGroups.length;
  const passedQuestionsCount = completedGroups.filter((g) => g.latestIsCorrect).length;
  const passRate =
    completedQuestionsCount > 0 ? Math.round((passedQuestionsCount / completedQuestionsCount) * 100) : 0;

  const avgScore =
    completedQuestionsCount > 0
      ? (
          completedGroups.reduce((acc, curr) => acc + (curr.latestScore || 0), 0) /
          completedQuestionsCount
        ).toFixed(1)
      : '0.0';

  const totalFilteredAttempts = filteredGroups.reduce((acc, g) => acc + g.totalAttempts, 0);

  const handleRepeat = async (group: QuestionGroup) => {
    if (!group.topic_id || repeatingTopicId) return;

    if (status !== 'loading' && session && (session?.tokens ?? 0) <= 0) {
      setShowNoTokensModal(true);
      return;
    }

    setRepeatingTopicId(group.topic_id);

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: group.topic_id }),
      });

      const data = await res.json();

      if (res.status === 402 || data.error?.toLowerCase().includes('token')) {
        setShowNoTokensModal(true);
        return;
      }

      if (res.ok && data.session) {
        await update();
        const prev = group.latestScore ?? 0;
        router.push(`/exam/${data.session.id}?prevScore=${prev}`);
      } else {
        alert(data.error || 'Nie udało się rozpocząć nowej próby zadania');
      }
    } catch {
      alert('Błąd połączenia z serwerem');
    } finally {
      setRepeatingTopicId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 font-sketch">
        <p className="text-xl font-bold animate-pulse text-slate-900">Ładowanie historii z zeszytu...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-3 sm:p-6 md:p-10 font-sketch">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="sketch-box p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-wider text-slate-900 uppercase">
              Moje wyniki i postępy
            </h1>
            <p className="text-sm sm:text-base font-bold text-slate-600">
              Historia rozwiązanych zadań i zmiana zrozumienia w czasie
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
            SUBJECT FILTER TABS (Notebook Tabs)
            ═════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
          {[
            { id: 'all', label: 'Wszystkie', count: counts.all },
            { id: 'matematyka', label: 'Matematyka', count: counts.matematyka },
            { id: 'polski', label: 'Język Polski', count: counts.polski },
            { id: 'geografia', label: 'Geografia', count: counts.geografia },
            { id: 'chemia', label: 'Chemia', count: counts.chemia },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedSubject(tab.id as SubjectFilter);
                setExpandedQuestionKey(null);
              }}
              className={`py-2.5 px-3 font-extrabold text-sm sm:text-base tracking-wide rounded-xl border-[2.5px] border-slate-900 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                selectedSubject === tab.id
                  ? 'bg-amber-100 text-slate-900 shadow-[4px_4px_0px_#0f172a] scale-[1.01]'
                  : 'bg-white text-slate-700 hover:bg-slate-50 shadow-[2px_2px_0px_#0f172a]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-md border font-extrabold ${
                  selectedSubject === tab.id
                    ? 'border-slate-900 bg-amber-200 text-slate-900'
                    : 'border-slate-300 bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Analytics Section */}
        {completedQuestionsCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* KPI 1: Circular average score */}
            <div className="sketch-box p-6 flex flex-col items-center justify-center text-center space-y-3 bg-white">
              <span className="text-xs sm:text-sm font-extrabold text-slate-600 uppercase tracking-wider">
                Średnia ocena zadań
              </span>
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full drop-shadow-xs overflow-visible"
                >
                  <g transform="rotate(-90 50 50)">
                    {/* Background track circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#e2e8f0"
                      strokeWidth="7"
                      fill="transparent"
                    />
                    {/* Progress indicator circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#0f172a"
                      strokeWidth="7"
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray={251.33}
                      strokeDashoffset={251.33 * (1 - Math.min(10, Math.max(0, parseFloat(avgScore) || 0)) / 10)}
                      className="transition-[stroke-dashoffset] duration-500 ease-out"
                    />
                  </g>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-extrabold text-slate-900 leading-none">
                    {avgScore}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase mt-1">
                    / 10 pkt
                  </span>
                </div>
              </div>
            </div>

            {/* KPI 2: Pass rate % */}
            <div className="sketch-box p-6 flex flex-col items-center justify-center text-center space-y-3 bg-white">
              <span className="text-xs sm:text-sm font-extrabold text-slate-600 uppercase tracking-wider">
                Skuteczność
              </span>
              <div className="flex flex-col items-center justify-center h-28">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">
                  {passRate}%
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase mt-1">
                  Opanowanych zadań
                </span>
              </div>
            </div>

            {/* KPI 3: Total questions and attempts */}
            <div className="sketch-box p-6 flex flex-col items-center justify-center text-center space-y-3 bg-white">
              <span className="text-xs sm:text-sm font-extrabold text-slate-600 uppercase tracking-wider">
                Opanowane zadania
              </span>
              <div className="flex flex-col items-center justify-center h-28">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">
                  {passedQuestionsCount}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase mt-1">
                  Z {totalQuestionsCount} podjętych zadań ({totalFilteredAttempts} prób łącznie)
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Questions History List - Exactly ONE card per question */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-slate-900 uppercase">
              Lista rozwiązanych zadań ({filteredGroups.length})
            </h2>
          </div>

          {questionGroups.length === 0 ? (
            <div className="sketch-box p-8 sm:p-12 text-center space-y-3 bg-white">
              <p className="text-lg font-bold text-slate-700">
                Nie rozwiązałeś jeszcze żadnego zadania.
              </p>
              <Link
                href="/topics"
                className="sketch-btn-black px-6 py-2.5 text-sm font-extrabold inline-block"
              >
                Rozpocznij pierwsze zadanie →
              </Link>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="sketch-box p-8 sm:p-12 text-center space-y-3 bg-white">
              <p className="text-lg font-bold text-slate-700">
                Brak rozwiązanych zadań w przedmiocie:{' '}
                <strong className="text-slate-900">
                  {selectedSubject === 'matematyka'
                    ? 'Matematyka'
                    : selectedSubject === 'polski'
                    ? 'Język Polski'
                    : 'Geografia'}
                </strong>
                .
              </p>
              <Link
                href={`/topics?przedmiot=${selectedSubject}`}
                className="sketch-btn-black px-6 py-2.5 text-sm font-extrabold inline-block"
              >
                Przejdź do zadań z tego przedmiotu →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGroups.map((group) => {
                const isExpanded = expandedQuestionKey === group.key;
                const hasCompleted = group.latestScore !== undefined;
                const formattedDate = new Date(group.lastAttemptDate).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={group.key}
                    className="sketch-box overflow-hidden bg-white transition-all"
                  >
                    {/* Header bar of the question card - single card per question */}
                    <div
                      onClick={() => setExpandedQuestionKey(isExpanded ? null : group.key)}
                      className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer hover:bg-amber-50/40 select-none"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {group.numer && (
                            <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-extrabold border-2 border-slate-900 bg-amber-100 text-slate-900">
                              Zadanie #{group.numer}
                            </span>
                          )}

                          {group.przedmiot && (
                            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-extrabold border border-slate-900 bg-amber-200 text-slate-900">
                              {group.przedmiot === 'chemia'
                                ? 'Chemia'
                                : group.przedmiot === 'geografia'
                                ? 'Geografia'
                                : group.przedmiot === 'polski'
                                ? 'Język Polski'
                                : 'Matematyka'}
                            </span>
                          )}

                          {/* Number of attempts badge */}
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-extrabold border border-slate-900 bg-slate-100 text-slate-800">
                            {formatAttemptsCount(group.totalAttempts)}
                          </span>

                          {/* Progress / knowledge change delta badge */}
                          {group.overallScoreDiff !== null && (
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-extrabold border ${
                                group.overallScoreDiff > 0
                                  ? 'border-emerald-900 bg-emerald-100 text-emerald-900'
                                  : group.overallScoreDiff < 0
                                  ? 'border-rose-900 bg-rose-100 text-rose-900'
                                  : 'border-slate-900 bg-amber-50 text-slate-800'
                              }`}
                            >
                              {group.overallScoreDiff > 0
                                ? `+${group.overallScoreDiff} pkt (Lepsze zrozumienie)`
                                : group.overallScoreDiff < 0
                                ? `${group.overallScoreDiff} pkt (Gorszy wynik)`
                                : 'Bez zmian'}
                            </span>
                          )}

                          <span className="text-xs font-bold text-slate-500 font-sans">
                            Ostatnia: {formattedDate}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                          {group.pytanie}
                        </h3>
                      </div>

                      {/* Right side status / latest score badge */}
                      <div className="flex items-center gap-3 shrink-0">
                        {hasCompleted ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-3 py-0.5 rounded-lg border-2 border-slate-900 text-xs font-extrabold shadow-[1px_1px_0px_#0f172a] ${
                                group.latestIsCorrect
                                  ? 'bg-emerald-100 text-emerald-950'
                                  : 'bg-rose-100 text-rose-950'
                              }`}
                            >
                              {group.latestIsCorrect ? 'Zaliczone' : 'Do poprawy'}
                            </span>
                            <span className="inline-flex items-center rounded-lg bg-amber-50 border-2 border-slate-900 px-2.5 py-0.5 text-sm font-extrabold shadow-[1px_1px_0px_#0f172a]">
                              {group.latestScore} / 10 pkt
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-extrabold px-3 py-1 rounded-md border-2 border-slate-300 text-slate-500">
                            W toku...
                          </span>
                        )}
                        <span className="text-slate-900 text-sm font-extrabold">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Expanded details: Progression and history of attempts */}
                    {isExpanded && (
                      <div className="border-t-2 border-dashed border-slate-300 bg-amber-50/20 p-4 sm:p-6 space-y-6">
                        
                        {/* Standard answer if present */}
                        {group.odpowiedz && (
                          <div className="rounded-xl border-2 border-slate-900 bg-white p-4 space-y-1 shadow-[2px_2px_0px_#0f172a]">
                            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 block">
                              Wzorcowa odpowiedź:
                            </span>
                            <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                              {group.odpowiedz}
                            </p>
                          </div>
                        )}

                        {/* Knowledge Evolution Section */}
                        <div className="rounded-xl border-2 border-slate-900 bg-white p-4 sm:p-5 space-y-4 shadow-[2px_2px_0px_#0f172a]">
                          <div className="border-b-2 border-dashed border-slate-200 pb-2">
                            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                              Jak zmieniała się Twoja wiedza z tego pytania
                            </h4>
                          </div>

                          {/* Progression chain / timeline */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            {group.attempts.map((att, idx) => {
                              const isCompleted = att.status === 'completed' && att.score !== undefined;
                              return (
                                <div key={att.id} className="flex items-center gap-2 sm:gap-3">
                                  <div
                                    className={`rounded-lg border-2 border-slate-900 px-3 py-2 text-center shadow-[1px_1px_0px_#0f172a] ${
                                      idx === group.attempts.length - 1
                                        ? 'bg-amber-100 ring-2 ring-slate-900'
                                        : 'bg-slate-50'
                                    }`}
                                  >
                                    <div className="text-[11px] font-extrabold uppercase text-slate-600">
                                      Próba #{att.attemptNumber}
                                    </div>
                                    <div className="text-base font-extrabold text-slate-900">
                                      {isCompleted ? `${att.score}/10` : 'W toku'}
                                    </div>
                                    {att.scoreDiff !== null && (
                                      <div
                                        className={`text-[10px] font-bold ${
                                          att.scoreDiff > 0
                                            ? 'text-emerald-700'
                                            : att.scoreDiff < 0
                                            ? 'text-rose-700'
                                            : 'text-slate-600'
                                        }`}
                                      >
                                        {att.scoreDiff > 0
                                          ? `+${att.scoreDiff} pkt`
                                          : att.scoreDiff < 0
                                          ? `${att.scoreDiff} pkt`
                                          : 'bez zmian'}
                                      </div>
                                    )}
                                  </div>
                                  {idx < group.attempts.length - 1 && (
                                    <span className="text-slate-400 font-extrabold text-lg select-none">
                                      →
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Summary text of the evolution */}
                          {group.totalAttempts > 1 ? (
                            <div
                              className={`p-3 rounded-lg border-2 border-slate-900 text-xs sm:text-sm font-bold ${
                                group.overallScoreDiff !== null && group.overallScoreDiff > 0
                                  ? 'bg-emerald-50 text-emerald-950'
                                  : group.overallScoreDiff !== null && group.overallScoreDiff < 0
                                  ? 'bg-rose-50 text-rose-950'
                                  : 'bg-amber-50 text-slate-900'
                              }`}
                            >
                              {group.overallScoreDiff !== null && group.overallScoreDiff > 0 ? (
                                <p>
                                  Wzrost poziomu zrozumienia: Twój wynik wzrósł o{' '}
                                  <span className="font-extrabold">+{group.overallScoreDiff} pkt</span>{' '}
                                  (od {group.firstAttempt?.score ?? 0}/10 do {group.latestScore}/10).
                                  Poprzednie uwagi AI przyniosły widoczny skutek!
                                </p>
                              ) : group.overallScoreDiff !== null && group.overallScoreDiff < 0 ? (
                                <p>
                                  Ostatnia próba uzyskała wynik niższy o{' '}
                                  <span className="font-extrabold">{Math.abs(group.overallScoreDiff)} pkt</span>{' '}
                                  (od {group.firstAttempt?.score ?? 0}/10 do {group.latestScore}/10).
                                  Zwróć uwagę na szczegóły pojęć wskazane w notatkach AI.
                                </p>
                              ) : (
                                <p>
                                  Wynik utrzymuje się na stałym poziomie{' '}
                                  <span className="font-extrabold">{group.latestScore ?? 0}/10 pkt</span>.
                                  Sprawdź poniższe uwagi, aby dowiedzieć się, co jeszcze wymaga doprecyzowania.
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm font-bold text-slate-600">
                              To Twoje pierwsze podejście do tego zadania. Kliknij przycisk poniżej, aby powtórzyć
                              odpowiedź i sprawdzić, czy Twoje zrozumienie się poprawiło.
                            </p>
                          )}
                        </div>

                        {/* Detailed breakdown of all attempts */}
                        <div className="space-y-3">
                          <h4 className="text-xs uppercase font-extrabold text-slate-600 tracking-wider">
                            Historia wszystkich analiz AI dla tego pytania ({group.attempts.length}):
                          </h4>

                          <div className="space-y-3">
                            {[...group.attempts].reverse().map((attempt) => {
                              const isCompleted = attempt.status === 'completed' && attempt.score !== undefined;
                              const isCorrect = Boolean(attempt.is_correct);
                              const attemptDate = new Date(attempt.created_at).toLocaleDateString('pl-PL', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              });

                              return (
                                <div
                                  key={attempt.id}
                                  className="rounded-xl border-2 border-slate-900 bg-white p-4 space-y-3 shadow-[1px_1px_0px_#0f172a]"
                                >
                                  {/* Attempt header */}
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-slate-200 pb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-extrabold text-slate-900">
                                        Próba #{attempt.attemptNumber}
                                      </span>
                                      <span className="text-xs font-bold text-slate-500 font-sans">
                                        {attemptDate}
                                      </span>
                                      {attempt.scoreDiff !== null && (
                                        <span
                                          className={`text-xs font-extrabold px-2 py-0.5 rounded border ${
                                            attempt.scoreDiff > 0
                                              ? 'border-emerald-900 bg-emerald-100 text-emerald-900'
                                              : attempt.scoreDiff < 0
                                              ? 'border-rose-900 bg-rose-100 text-rose-900'
                                              : 'border-slate-900 bg-slate-100 text-slate-800'
                                          }`}
                                        >
                                          {attempt.scoreDiff > 0
                                            ? `+${attempt.scoreDiff} pkt`
                                            : attempt.scoreDiff < 0
                                            ? `${attempt.scoreDiff} pkt`
                                            : 'bez zmian'}
                                        </span>
                                      )}
                                    </div>

                                    {isCompleted ? (
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-extrabold border border-slate-900 ${
                                            isCorrect
                                              ? 'bg-emerald-100 text-emerald-950'
                                              : 'bg-rose-100 text-rose-950'
                                          }`}
                                        >
                                          {isCorrect ? 'Zaliczone' : 'Do poprawy'}
                                        </span>
                                        <span className="text-xs font-extrabold bg-amber-50 border border-slate-900 px-2 py-0.5 rounded">
                                          {attempt.score} / 10 pkt
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs font-bold text-slate-500">W toku...</span>
                                    )}
                                  </div>

                                  {/* AI Feedback */}
                                  {attempt.feedback ? (
                                    <div className="space-y-1">
                                      <span className="text-[11px] uppercase font-extrabold text-slate-500 tracking-wider block">
                                        Notatka AI egzaminatora:
                                      </span>
                                      <div
                                        className="prose prose-slate max-w-none text-slate-900 leading-relaxed space-y-1.5 font-sketch text-sm"
                                        dangerouslySetInnerHTML={{
                                          __html: marked.parse(attempt.feedback) as string,
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <p className="text-xs font-bold text-slate-500 italic">
                                      Brak szczegółowej analizy dla tej próby.
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Action: Repeat this question */}
                        {group.topic_id && (
                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRepeat(group)}
                              disabled={repeatingTopicId === group.topic_id}
                              className="sketch-btn-black px-4 py-2 text-sm font-extrabold flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#0f172a]"
                            >
                              {repeatingTopicId === group.topic_id ? (
                                <span>Tworzenie nowej próby...</span>
                              ) : (
                                <span>Powtórz to zadanie (Nowa próba) →</span>
                              )}
                            </button>
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

      {/* No Tokens Modal Window */}
      <NoTokensModal
        isOpen={showNoTokensModal}
        onClose={() => setShowNoTokensModal(false)}
      />
    </main>
  );
}

