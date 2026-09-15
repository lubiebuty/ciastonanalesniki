'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import WimpyRobot from '@/components/sketch/WimpyRobot';

/**
 * Sign-in page redesigned in Diary of a Wimpy Kid comic style (from Page 1 of concept sketches).
 */
function LoginContent() {
  const searchParams = useSearchParams();
  const callbackParam = searchParams.get('callbackUrl');
  const callbackUrl = (!callbackParam || callbackParam === '/') ? '/wybierz-droge' : callbackParam;
  const error = searchParams.get('error');

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-10 font-sketch">
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-150">
        
        {/* Robot Bob with speech bubble (Page 1 concept) */}
        <div className="py-2">
          <WimpyRobot message="HEJ, BOB, MIŁO CIĘ POZNAĆ, BOB." />
        </div>

        <div className="space-y-1 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-slate-900 uppercase">
            Ewaluator Zadań
          </h1>
          <p className="text-base font-bold text-slate-600 leading-relaxed">
            Sprawdź swoją wiedzę z natychmiastową oceną AI
          </p>
        </div>

        {error && (
          <div className="rounded-xl border-[2.5px] border-slate-900 bg-rose-50 p-4 text-sm font-extrabold text-rose-900 shadow-[3px_3px_0px_#0f172a]">
            Logowanie nie powiodło się. Spróbuj ponownie.
          </div>
        )}

        <div className="sketch-box p-6 sm:p-7 space-y-5 bg-white">
          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full sketch-btn p-3.5 font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 cursor-pointer shadow-[4px_4px_0px_#0f172a]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
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
            <span>Zaloguj się przez Google</span>
          </button>

          <div className="rounded-xl bg-amber-50 border-2 border-slate-900 p-3.5 text-center space-y-1 shadow-[2px_2px_0px_#0f172a]">
            <p className="text-sm text-slate-900 font-extrabold uppercase">
              10 darmowych tokenów na start
            </p>
            <p className="text-xs text-slate-600 font-bold">
              1 token = 1 sesja rozwiązywania zadania z oceną AI
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 font-bold text-center leading-relaxed">
          Nagrania audio nie są zapisywane — po transkrypcji mowy są natychmiast usuwane.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen font-sketch" />}>
      <LoginContent />
    </Suspense>
  );
}
