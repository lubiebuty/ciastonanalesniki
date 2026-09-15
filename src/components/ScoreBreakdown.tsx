'use client';

import { marked } from 'marked';

interface ScoreBreakdownProps {
  scores: {
    is_correct: boolean | number;
    score: number;
  };
  feedback?: string;
}

export default function ScoreBreakdown({ scores, feedback }: ScoreBreakdownProps) {
  const isCorrect = Boolean(scores.is_correct);
  const percentage = (scores.score / 10) * 100;

  return (
    <div className="space-y-5 font-sketch">
      {/* Total Score Stamp Card */}
      <div className="sketch-box p-6 sm:p-8 text-center space-y-3 bg-white relative overflow-hidden">
        <div className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-slate-500">
          Karta Oceny Egzaminatora
        </div>

        {/* Big Hand-drawn Grade / Stamp */}
        <div className="inline-flex items-baseline justify-center gap-1.5 px-6 py-2 rounded-2xl border-[3px] border-slate-900 bg-amber-50 shadow-[4px_4px_0px_#0f172a]">
          <span className="text-5xl sm:text-6xl font-extrabold text-slate-900">
            {scores.score}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-slate-500">
            / 10
          </span>
        </div>

        <div>
          <span
            className={`inline-flex items-center gap-2 rounded-xl border-2 border-slate-900 px-4 py-1.5 text-sm sm:text-base font-extrabold shadow-[2px_2px_0px_#0f172a] ${
              isCorrect ? 'bg-emerald-100 text-emerald-950' : 'bg-rose-100 text-rose-950'
            }`}
          >
            <span>{isCorrect ? 'ZALICZONE' : 'DO POPRAWY'}</span>
          </span>
        </div>

        <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wide">
          Ocena merytoryki, toku rozumowania i argumentacji
        </p>
      </div>

      {/* Progress Hatch Bar */}
      <div className="sketch-box p-4 sm:p-5 bg-white space-y-2">
        <div className="flex items-center justify-between text-sm sm:text-base font-extrabold text-slate-900">
          <span>Wynik procentowy:</span>
          <span className="text-lg">{Math.round(percentage)}%</span>
        </div>
        <div className="h-4 rounded-xl border-2 border-slate-900 bg-slate-100 overflow-hidden p-0.5">
          <div
            className="h-full rounded-lg bg-slate-900 transition-all duration-500 sketch-hatch"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Feedback Notebook Note */}
      {feedback && (
        <div className="sketch-box p-5 sm:p-7 bg-amber-50/50 space-y-3">
          <div className="flex items-center gap-2 border-b-2 border-dashed border-slate-300 pb-2">
            <svg className="w-5 h-5 stroke-slate-900 fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <p className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-slate-900">
              Uwagi i Notatki AI:
            </p>
          </div>
          <div 
            className="text-base sm:text-lg leading-relaxed space-y-2 text-slate-900 font-sketch"
            dangerouslySetInnerHTML={{ __html: marked.parse(feedback) as string }}
          />
        </div>
      )}
    </div>
  );
}
