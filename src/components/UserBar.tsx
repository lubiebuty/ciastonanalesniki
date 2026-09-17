'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Cpu } from 'lucide-react';

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
  role?: string;
  onSignOut: () => void;
}

export default function UserBar({ user, tokens, role, onSignOut }: UserBarProps) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const pathname = usePathname();

  const isTeacherZone = pathname?.startsWith('/teacher') || pathname?.startsWith('/hide-and-seek');

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

  if (isTeacherZone) {
    return (
      <div className="space-y-3 mb-4 sm:mb-6 select-none font-mono relative z-50">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b-4 border-green-900 bg-gray-950/90 px-4 sm:px-6 py-3 sm:py-4 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
          <div className="flex items-center gap-4 min-w-0">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt=""
                className="w-10 h-10 border-2 border-green-500 shrink-0 opacity-80"
              />
            ) : (
              <span
                aria-hidden="true"
                className="w-10 h-10 bg-green-950/50 text-green-500 flex items-center justify-center text-sm font-bold shrink-0 border-2 border-green-700 uppercase"
              >
                {(user.name || user.email).charAt(0)}
              </span>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-green-400 truncate tracking-widest uppercase">
                {user.name || 'Admin'}
              </span>
              <span className="text-[10px] text-green-700 font-bold truncate uppercase tracking-[0.2em]">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-dashed border-green-900">
            {/* AI Engine Status - Dexter Style */}
            <div className="relative group">
              <div
                className="flex items-center gap-2 border-2 border-green-900 bg-black px-3 py-1.5 text-[10px] font-bold text-green-500 cursor-help"
                title="Status Sieci"
              >
                <Cpu className={`w-3 h-3 ${isHealthy ? 'animate-pulse text-green-400' : 'text-red-500'}`} />
                <span className="uppercase tracking-widest">
                  {isHealthy ? 'System ON' : 'System ERR'}
                </span>
              </div>

              {/* Hover tooltip card */}
              <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 w-64 p-4 border-2 border-green-700 bg-gray-950 shadow-[0_0_15px_rgba(34,197,94,0.2)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="flex items-center justify-between border-b border-dashed border-green-900 pb-2 mb-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-green-500">Analiza Systemów</span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${
                      isHealthy ? 'text-green-400' : 'text-red-500'
                    }`}
                  >
                    {isHealthy ? 'STABILNE' : 'AWARIA'}
                  </span>
                </div>

                <div className="space-y-2 text-[10px] uppercase tracking-widest font-bold text-green-700">
                  {health?.stt && (
                    <div className="flex items-center justify-between">
                      <span>Protokół Audio:</span>
                      <span className={health.stt.ok ? 'text-green-400' : 'text-red-500'}>
                        {health.stt.ok ? 'OK' : 'ERR'}
                      </span>
                    </div>
                  )}
                  {health?.llm && (
                    <div className="flex items-center justify-between">
                      <span>Protokół Złożony:</span>
                      <span className={health.llm.ok ? 'text-green-400' : 'text-red-500'}>
                        {health.llm.ok ? 'OK' : 'ERR'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-2 border-green-900 bg-black px-3 py-1.5 text-[10px] font-bold text-green-500 uppercase tracking-widest">
              <span className="text-green-400">{tokens}</span>
              <span className="text-green-700">PWR</span>
            </div>

            {role === 'teacher' && (
              <Link
                href="/"
                className="border-2 border-purple-900 bg-purple-950/20 hover:bg-purple-900 px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold text-purple-400 hover:text-black transition-colors flex items-center"
              >
                Pulpit Ucznia
              </Link>
            )}

            <button
              onClick={onSignOut}
              className="border-2 border-red-900 bg-black hover:bg-red-900 px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-black transition-colors"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT (Student) Cwaniaczek Zone
  return (
    <div className="space-y-3 mb-4 sm:mb-6 select-none font-sketch relative z-50">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border-[2.5px] border-slate-900 bg-white px-4 sm:px-5 py-2.5 sm:py-3 shadow-[4px_4px_0px_#0f172a]">
        <div className="flex items-center gap-3 min-w-0">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="w-9 h-9 rounded-full border-2 border-slate-900 shrink-0"
            />
          ) : (
            <span
              aria-hidden="true"
              className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shrink-0 border-2 border-slate-900"
            >
              {(user.name || user.email).charAt(0).toUpperCase()}
            </span>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-slate-900 truncate tracking-wide">
              {user.name || 'Uczeń'}
            </span>
            <span className="text-xs text-slate-500 font-sans truncate">{user.email}</span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-dashed border-slate-300">
          {/* AI Engine Status indicator with hover tooltip */}
          <div className="relative group">
            <div
              className="flex items-center gap-1.5 rounded-lg bg-white border-2 border-slate-900 px-2.5 py-1 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_#0f172a] cursor-help"
              title="Stan silnika AI"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="text-slate-900 tracking-wide">
                {isHealthy ? 'AI gotowe' : 'AI offline'}
              </span>
            </div>

            {/* Hover tooltip card */}
            <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 w-64 p-3.5 rounded-xl border-2 border-slate-900 bg-white shadow-[4px_4px_0px_#0f172a] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 space-y-2 pointer-events-none group-hover:pointer-events-auto">
              <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-1.5">
                <span className="text-xs font-bold text-slate-900">Stan Silnika AI</span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                    isHealthy ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isHealthy ? 'Działa' : 'Błąd'}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                {health?.stt && (
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-slate-600">Mowa (STT):</span>
                    <span className={`font-mono font-medium text-[11px] ${health.stt.ok ? 'text-slate-900' : 'text-rose-600'}`}>
                      {health.stt.ok ? health.stt.model : 'Błąd'}
                    </span>
                  </div>
                )}
                {health?.llm && (
                  <div className="flex items-center justify-between py-0.5">
                    <span className="text-slate-600">Ocena (LLM):</span>
                    <span className={`font-mono font-medium text-[11px] ${health.llm.ok ? 'text-slate-900' : 'text-rose-600'}`}>
                      {health.llm.ok ? health.llm.model : 'Błąd'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border-2 border-slate-900 px-3 py-1 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_#0f172a]">
            <svg className="w-3.5 h-3.5 stroke-slate-900 fill-amber-300" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="font-bold text-sm">{tokens}</span>
            <span className="text-slate-700">
              {tokens === 1 ? 'token' : tokens >= 2 && tokens <= 4 ? 'tokeny' : 'tokenów'}
            </span>
          </div>

          {role === 'teacher' && (
            <Link
              href="/teacher/classes"
              className="rounded-lg border-2 border-purple-900 bg-purple-100 hover:bg-purple-200 px-3 py-1 text-xs font-bold text-purple-900 shadow-[2px_2px_0px_#581c87] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center cursor-pointer"
            >
              Prawa Nauczyciela
            </Link>
          )}

          <button
            onClick={onSignOut}
            className="rounded-lg border-2 border-slate-900 bg-white hover:bg-slate-100 px-3 py-1 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_#0f172a] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            Wyloguj
          </button>
        </div>
      </div>
    </div>
  );
}
