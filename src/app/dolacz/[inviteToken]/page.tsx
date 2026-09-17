'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Users, XCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function JoinClassPage() {
  const params = useParams<{ inviteToken: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [className, setClassName] = useState('');

  // Auto redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('google', { callbackUrl: window.location.href });
    }
  }, [status]);

  const handleJoinClass = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/student/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteToken: params?.inviteToken }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(`Pomyślnie dołączyłeś do grupy: ${data.className}!`);
        setClassName(data.className);
        setTimeout(() => {
          router.push('/');
        }, 2500);
      } else {
        setError(data.error || 'Ups! Coś poszło nie tak.');
      }
    } catch (err: any) {
      setError(err.message || 'Wystąpił nieznany błąd.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 font-sketch">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-amber-50 p-4 sm:p-6 md:p-10 font-sketch selection:bg-amber-200">
      <div className="max-w-md w-full relative">
        
        {/* Dekoracyjna taśma z góry */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-amber-200/80 -rotate-2 z-10"></div>
        
        <div className="sketch-box bg-white relative overflow-hidden flex flex-col items-center text-center p-8 sm:p-12">
          
          <div className="w-20 h-20 bg-amber-100 border-[3px] border-slate-900 rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_#0f172a] transform -rotate-6">
            <Users className="w-10 h-10 text-slate-900" />
          </div>

          <div className="inline-block px-3 py-1 mb-4 rounded-md border-2 border-slate-900 bg-amber-200 font-extrabold text-xs uppercase tracking-wider text-slate-900 shadow-[2px_2px_0px_#0f172a] -rotate-2">
            Protokół dołączenia
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide leading-tight text-slate-900 mb-2">
            Czy na pewno jesteś gotowy?
          </h1>
          
          <p className="text-lg font-bold text-slate-600 mb-8 leading-relaxed">
            Zalogowano jako <span className="text-slate-900 bg-amber-100 px-1">{session?.user?.email}</span>.<br/><br/>
            Zaraz wejdziesz do nowej klasy. No, zostaniesz prawdziwym cwaniakiem.
          </p>

          {error && (
            <div className="w-full mb-6 bg-rose-50 border-[3px] border-slate-900 p-4 flex flex-col items-center gap-2 rounded-xl shadow-[4px_4px_0px_#0f172a] transform rotate-1">
              <XCircle className="w-8 h-8 text-rose-500" />
              <p className="font-extrabold text-slate-900 text-lg">{error}</p>
            </div>
          )}

          {success ? (
            <div className="w-full mb-6 bg-emerald-50 border-[3px] border-slate-900 p-6 flex flex-col items-center gap-3 rounded-xl shadow-[4px_4px_0px_#0f172a] transform -rotate-1">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              <p className="text-slate-900 font-extrabold text-xl">{success}</p>
              <p className="text-sm font-bold text-slate-600">Zaraz ruszamy dalej...</p>
            </div>
          ) : (
            <button
              onClick={handleJoinClass}
              disabled={loading}
              className="w-full sketch-btn-black py-4 text-xl font-extrabold flex justify-center items-center gap-2 mb-4"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Przetwarzanie...</span>
                </>
              ) : (
                <span>Wchodzę w to!</span>
              )}
            </button>
          )}

          {!success && (
            <Link 
              href="/" 
              className="text-base font-bold text-slate-500 hover:text-slate-900 underline decoration-2 underline-offset-4 transition-colors"
            >
              Zmieniłem zdanie, wracam
            </Link>
          )}

        </div>
      </div>
    </main>
  );
}
