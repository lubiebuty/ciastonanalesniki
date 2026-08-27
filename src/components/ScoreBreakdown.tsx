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
    <div className="space-y-4">
      {/* Total Score */}
      <div className="text-center space-y-3 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
        <div className="text-5xl font-mono font-bold tracking-tight text-slate-900">
          {scores.score}
          <span className="text-xl text-slate-400 font-normal"> / 10</span>
        </div>
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-900">
            <span
              className={`w-2 h-2 rounded-full ${
                isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span>{isCorrect ? 'Zaliczone' : 'Do poprawy'}</span>
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Ocena poprawności i toku rozumowania
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span>Wynik procentowy</span>
          <span className="font-mono font-bold text-slate-900">{Math.round(percentage)}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-2.5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Komentarz tutora AI:
          </p>
          <div 
            className="text-sm leading-relaxed prose prose-slate max-w-none space-y-2 text-slate-800"
            dangerouslySetInnerHTML={{ __html: marked.parse(feedback) as string }}
          />
        </div>
      )}
    </div>
  );
}
