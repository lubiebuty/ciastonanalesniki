'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

/**
 * Sign-in page (Ticket 02).
 *
 * `lib/auth.ts` points NextAuth's `pages.signIn` here, so this route has to
 * exist — without it every unauthenticated redirect lands on a 404.
 */
function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-sm space-y-6 animate-in fade-in duration-150">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white font-mono font-bold text-lg shadow-xs">
            EZ
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Ewaluator Zadań
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sprawdź swoją wiedzę z natychmiastową oceną AI
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-white p-3.5 text-xs font-medium text-red-700 shadow-xs">
            Logowanie nie powiodło się. Spróbuj ponownie.
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4 shadow-xs">
          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 px-4 py-3 font-semibold text-xs shadow-2xs transition-colors flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75z"
              />
            </svg>
            Zaloguj się przez Google
          </button>

          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-center space-y-0.5">
            <p className="text-xs text-slate-800 font-semibold">
              10 darmowych tokenów na start
            </p>
            <p className="text-[11px] text-slate-500">
              1 token = 1 sesja rozwiązywania zadania z oceną AI
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          Nagrania audio nie są zapisywane — po transkrypcji mowy są natychmiast usuwane.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <LoginContent />
    </Suspense>
  );
}
