'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Cpu, ShieldAlert, FileText, Bot, User, CheckCircle, BrainCircuit } from 'lucide-react';

interface SessionDetails {
  id: string;
  created_at: string;
  status: string;
  topics: {
    przedmiot: string;
    numer: number;
    pytanie: string;
  } | null;
  session_scores: {
    is_correct: boolean;
    score: number;
    feedback: string;
  }[] | null;
}

interface Transcript {
  id: string;
  session_id: string;
  text: string;
  chunk_index: number;
  created_at: string;
}

export default function TeacherSessionDetailsPage() {
  const params = useParams<{ classId: string, studentId: string, sessionId: string }>();
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.role !== 'teacher')) {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && params?.classId && params?.studentId && params?.sessionId) {
      fetchSessionDetails(params.classId, params.studentId, params.sessionId);
    }
  }, [status, session, params]);

  const fetchSessionDetails = async (classId: string, studentId: string, sessionId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/teacher/classes/${classId}/student/${studentId}/session/${sessionId}`);
      const data = await res.json();
      
      if (res.ok) {
        setSessionDetails(data.session);
        setTranscripts(data.transcripts || []);
      } else {
        setError(data.error || 'Nie znaleziono sesji.');
      }
    } catch (e: any) {
      setError(e.message || 'Wystąpił nieznany błąd.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-green-500 font-mono">
        <div className="flex flex-col items-center gap-4">
          <Cpu className="w-16 h-16 animate-pulse" />
          <p className="uppercase tracking-[0.3em] font-bold">Pobieranie transkryptu operacyjnego...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-red-500 font-mono p-4 text-center">
        <ShieldAlert className="w-16 h-16 mb-4" />
        <p className="uppercase tracking-[0.3em] font-bold mb-6">{error || 'Błąd dostępu do akt'}</p>
        <Link 
          href={`/teacher/classes/${params?.classId}/student/${params?.studentId}`}
          className="border-2 border-red-900 bg-red-950/30 text-red-400 px-6 py-2 uppercase font-bold tracking-widest hover:bg-red-900 transition-colors"
        >
          Wróć
        </Link>
      </div>
    );
  }

  const scoreData = Array.isArray(sessionDetails.session_scores) 
    ? sessionDetails.session_scores[0] 
    : sessionDetails.session_scores;

  const isCompleted = sessionDetails.status === 'completed';
  const hasScore = scoreData?.score !== undefined;

  return (
    <main className="min-h-screen bg-[#050505] text-green-500 p-4 md:p-8 font-mono overflow-hidden relative selection:bg-purple-500/30">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#15803d 1px, transparent 1px), linear-gradient(90deg, #15803d 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      ></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-6 pb-20">
        
        {/* Header - Dexter Lab Style */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-gray-950/80 border-4 border-green-700 p-6 shadow-[0_0_20px_rgba(34,197,94,0.15)] relative">
          <div className="absolute top-0 left-0 w-4 h-4 bg-green-500 animate-pulse border-b-2 border-r-2 border-green-900"></div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 animate-pulse border-b-2 border-l-2 border-green-900"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-green-500 animate-pulse border-t-2 border-r-2 border-green-900"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 animate-pulse border-t-2 border-l-2 border-green-900"></div>

          <div className="flex items-center gap-6 w-full">
            <Link 
              href={`/teacher/classes/${params?.classId}/student/${params?.studentId}`}
              className="group p-3 bg-gray-900 border-2 border-green-700 hover:bg-green-700 hover:text-black transition-all shadow-[0_0_10px_rgba(34,197,94,0.3)]"
              title="Wróć do profilu ucznia"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-purple-500" />
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                  Akta nr {sessionDetails.id.split('-')[0]}
                </h1>
              </div>
              <p className="text-sm text-green-700 uppercase tracking-[0.2em] font-bold mt-1 pl-11">
                Status operacji: {sessionDetails.status}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Transcript View */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-950/90 border-4 border-green-900 flex flex-col h-[700px]">
              <div className="bg-green-950 border-b-2 border-green-900 p-3 flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-green-600">Dekoder_Rozmow.exe</span>
                <div className="w-16"></div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
                {transcripts.length === 0 ? (
                  <div className="text-center py-12 text-green-800">
                    &gt; Brak zapisów w rejestrze dla tej sesji.
                  </div>
                ) : (
                  transcripts.map((t, idx) => {
                    // Cwaniak responses are usually marked with "Cwaniak:" or we assume the student is the first to speak if they started. 
                    // Actually, the transcript is usually alternating. 
                    // Since it's raw text chunks (whisper outputs), it usually represents user speech.
                    // Let's check how the transcript chunk is structured. If it's just user audio transcribed, it's all student.
                    // But if it contains system text, it might be prefixed.
                    // For now, we render it simply, assuming each chunk is an interaction.
                    
                    const isSystem = t.text.startsWith('Symulator:') || t.text.startsWith('Egzaminator:');
                    
                    return (
                      <div key={t.id} className={`flex flex-col ${isSystem ? 'items-start' : 'items-end'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-green-700 uppercase tracking-widest font-bold">
                            {isSystem ? 'Symulator (AI)' : 'Obiekt Badawczy'}
                          </span>
                          {isSystem ? <Bot className="w-3 h-3 text-purple-500" /> : <User className="w-3 h-3 text-green-500" />}
                        </div>
                        <div className={`p-4 max-w-[85%] border-2 ${
                          isSystem 
                            ? 'bg-purple-950/30 border-purple-900 text-purple-200' 
                            : 'bg-black/60 border-green-900 text-green-300'
                        }`}>
                          <p className="font-mono text-sm leading-relaxed">{t.text}</p>
                        </div>
                        <span className="text-[9px] text-gray-600 mt-1">
                          Czujnik {t.chunk_index} // {new Date(t.created_at).toLocaleTimeString('pl-PL')}
                        </span>
                      </div>
                    );
                  })
                )}

                {/* Evaluation injected into conversation */}
                {isCompleted && hasScore ? (
                  <div className="flex flex-col items-start mt-8 border-t-2 border-dashed border-purple-900/50 pt-8">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">
                        Symulator (Ewaluator)
                      </span>
                      <CheckCircle className="w-3 h-3 text-purple-500" />
                    </div>
                    <div className="p-4 w-full border-2 bg-purple-950/30 border-purple-900 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.15)] relative">
                      <div className="absolute -top-3 -right-3 bg-purple-600 text-black text-[10px] font-black uppercase px-2 py-1 transform rotate-6">
                        WYNIK: {scoreData.score}/10
                      </div>
                      
                      <div className="mb-4 text-center">
                        <span className="text-[10px] text-purple-500/70 uppercase tracking-widest font-bold block mb-1">
                          Ocena Końcowa Obiektu
                        </span>
                        <div className="text-3xl font-black text-purple-400">
                          {scoreData.score} <span className="text-lg text-purple-700">/ 10</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-purple-500/70 uppercase tracking-widest font-bold block mb-1">
                          Raport Maszyny (Feedback)
                        </span>
                        <div className="bg-purple-950/40 border border-purple-900 p-4 text-purple-300 text-sm font-mono leading-relaxed">
                          {scoreData.feedback || 'Brak raportu z ewaluacji.'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] text-purple-900 mt-2">
                      Protokół Zakończony
                    </span>
                  </div>
                ) : !isCompleted && (
                  <div className="flex flex-col items-center justify-center text-center mt-8 p-6 border-t-2 border-dashed border-gray-800">
                    <Cpu className="w-6 h-6 text-gray-600 mb-2 animate-spin-slow" />
                    <span className="text-gray-500 uppercase tracking-widest font-bold text-[10px]">
                      Oczekiwanie na analizę systemu...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            
            {/* Question Details */}
            <div className="bg-gray-950/80 border-4 border-green-900 p-6 relative">
              <h3 className="text-lg font-bold text-green-400 mb-4 uppercase tracking-widest flex items-center gap-2 border-b-2 border-green-900 pb-4">
                <BrainCircuit className="w-5 h-5 text-green-500" /> Parametry Testu
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-green-700 uppercase tracking-widest font-bold block mb-1">
                    Przedmiot / Numer
                  </span>
                  <div className="bg-black border border-green-900 p-2 text-green-400 text-sm font-bold uppercase">
                    {sessionDetails.topics?.przedmiot} // Pytanie {sessionDetails.topics?.numer}
                  </div>
                </div>
                
                <div>
                  <span className="text-[10px] text-green-700 uppercase tracking-widest font-bold block mb-1">
                    Treść Pytania
                  </span>
                  <div className="bg-black/50 border border-dashed border-green-900 p-4 text-green-300 text-sm italic">
                    {sessionDetails.topics?.pytanie || 'Brak treści pytania w bazie.'}
                  </div>
                </div>
              </div>
            </div>

            
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #052e16; border-left: 2px solid #14532d; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #22c55e; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4ade80; }
        
        .animate-spin-slow { animation: spin 4s linear infinite; }
      `}</style>
    </main>
  );
}
