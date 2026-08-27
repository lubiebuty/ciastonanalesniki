'use client';

import { useEffect, useState } from 'react';

interface ModelStatus {
  ok: boolean;
  model: string;
  error?: string;
}

interface HealthData {
  status: 'healthy' | 'unhealthy' | 'error';
  stt?: ModelStatus;
  llm?: ModelStatus;
  message?: string;
  timestamp: string;
}

interface UserBarProps {
  user: { email: string; name?: string | null; image?: string | null };
  tokens: number;
  onSignOut: () => void;
}

/**
 * Signed-in header: identity, token balance, AI engine status indicator, and sign-out.
 */
export default function UserBar({ user, tokens, onSignOut }: UserBarProps) {
  const [health, setHealth] = useState<HealthData | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(setHealth)
      .catch((err) =>
        setHealth({
          status: 'error',
          message: err.message,
          timestamp: new Date().toISOString(),
        })
      );
  }, []);

  const isHealthy = health?.status === 'healthy';

  return (
    <div className="space-y-3 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-slate-200 bg-white px-4 sm:px-5 py-3 sm:py-3.5 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- avatar comes from Google's CDN, no loader configured
            <img
              src={user.image}
              alt=""
              className="w-8 h-8 rounded-full border border-slate-200 shrink-0"
            />
          ) : (
            <span
              aria-hidden="true"
              className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0"
            >
              {(user.name || user.email).charAt(0).toUpperCase()}
            </span>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-900 truncate">
              {user.name || 'Uczeń'}
            </span>
            <span className="text-xs text-slate-500 truncate">{user.email}</span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {/* AI Engine Status indicator with hover tooltip */}
          <div className="relative group">
            <div
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-900 cursor-help"
              title="Stan silnika AI"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="text-slate-600 font-medium hidden sm:inline">
                {isHealthy ? 'AI gotowe' : 'AI offline'}
              </span>
            </div>

            {/* Hover tooltip card */}
            <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 w-64 p-3.5 rounded-xl border border-slate-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 space-y-2.5 pointer-events-none group-hover:pointer-events-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Stan Silnika AI</span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                    isHealthy ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  {isHealthy ? 'Działa prawidłowo' : 'Błąd połączenia'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                {health?.stt && (
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-slate-500">Mowa (STT):</span>
                    <span className={`font-mono font-medium text-[11px] ${health.stt.ok ? 'text-slate-800' : 'text-rose-600'}`}>
                      {health.stt.ok ? health.stt.model : 'Błąd'}
                    </span>
                  </div>
                )}
                {health?.llm && (
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-slate-500">Ocena (LLM):</span>
                    <span className={`font-mono font-medium text-[11px] ${health.llm.ok ? 'text-slate-800' : 'text-rose-600'}`}>
                      {health.llm.ok ? health.llm.model : 'Błąd'}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500">Baza danych:</span>
                  <span className="font-mono font-medium text-[11px] text-slate-800">
                    SQLite (WAL)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-900">
            <span className="font-mono font-bold">{tokens}</span>
            <span className="text-slate-500 font-normal">
              {tokens === 1 ? 'token' : 'tokeny'}
            </span>
          </div>

          <button
            onClick={onSignOut}
            className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
          >
            Wyloguj
          </button>
        </div>
      </div>
    </div>
  );
}
