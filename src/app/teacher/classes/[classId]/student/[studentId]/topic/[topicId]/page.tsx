'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Cpu, ShieldAlert, FileText, Bot, User, CheckCircle, BrainCircuit } from 'lucide-react';
import { marked } from 'marked';

interface Attempt {
  id: string;
  created_at: string;
  status: string;
  session_scores: {
    is_correct: boolean;
    score: number;
    feedback: string;
  }[] | null;
  transcripts: {
    id: string;
    text: string;
    chunk_index: number;
    created_at: string;
  }[];
}

interface TopicDetails {
  id: string;
  przedmiot: string;
  numer: number;
  pytanie: string;
}

export default function TeacherTopicDetailsPage() {
  const params = useParams<{ classId: string, studentId: string, topicId: string }>();
  const [topic, setTopic] = useState<TopicDetails | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.role !== 'teacher')) {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && params?.classId && params?.studentId && params?.topicId) {
      fetchTopicAttempts(params.classId, params.studentId, params.topicId);
    }
  }, [status, session, params]);

  const fetchTopicAttempts = async (classId: string, studentId: string, topicId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/teacher/classes/${classId}/student/${studentId}/topic/${topicId}`);
      const data = await res.json();
      
      if (res.ok) {
        setTopic(data.topic);
        setAttempts(data.attempts || []);
      } else {
        setError(data.error || 'Nie znaleziono zadania.');
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
          <p className="uppercase tracking-[0.3em] font-bold">Analiza wszystkich prób dla zadania...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
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

  return (
    <main className="min-h-screen bg-[#050505] text-green-500 p-4 md:p-8 font-mono overflow-hidden relative selection:bg-purple-500/30">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#15803d 1px, transparent 1px), linear-gradient(90deg, #15803d 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      ></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-6 pb-20">
        
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
                  {topic.przedmiot} :: Pytanie {topic.numer}
                </h1>
              </div>
              <p className="text-sm text-green-700 uppercase tracking-[0.2em] font-bold mt-1 pl-11">
                Liczba Zarejestrowanych Podejść: {attempts.length}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Transcripts View */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-950/90 border-4 border-green-900 flex flex-col max-h-[800px]">
              <div className="bg-green-950 border-b-2 border-green-900 p-3 flex justify-between items-center sticky top-0 z-10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-green-600">Chronologia_Zdarzen.exe</span>
                <div className="w-16"></div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-12 custom-scrollbar">
                {attempts.length === 0 ? (
                  <div className="text-center py-12 text-green-800">
                    &gt; Brak zapisów w rejestrze dla tego zadania.
                  </div>
                ) : (
                  attempts.map((attempt, index) => {
                    const isCompleted = attempt.status === 'completed';
                    const scoreData = Array.isArray(attempt.session_scores) ? attempt.session_scores[0] : attempt.session_scores;
                    const hasScore = scoreData?.score !== undefined;

                    return (
                      <div key={attempt.id} className="relative border-l-2 border-dashed border-green-900 pl-6 pb-6">
                        <div className="absolute -left-3 top-0 w-6 h-6 bg-black border-2 border-green-500 flex items-center justify-center text-[10px] font-bold text-green-400 z-10">
                          {index + 1}
                        </div>
                        
                        <div className="text-[10px] text-green-700 uppercase tracking-widest font-bold mb-4">
                          Próba z {new Date(attempt.created_at).toLocaleString('pl-PL')} 
                          <span className="ml-2 bg-gray-900 px-2 py-0.5 border border-gray-700">&gt; Status: {attempt.status}</span>
                        </div>

                        <div className="space-y-4">
                          {attempt.transcripts.map((t) => {
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
                                  {isSystem ? (
                                    <div 
                                      className="font-mono text-sm leading-relaxed markdown-content"
                                      dangerouslySetInnerHTML={{ __html: marked.parse(t.text) as string }}
                                    />
                                  ) : (
                                    <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap">{t.text}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {isCompleted && hasScore ? (
                            <div className="flex flex-col items-start mt-6 border-t-2 border-dashed border-purple-900/50 pt-6">
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
                                <div className="mb-2">
                                  <span className="text-[10px] text-purple-500/70 uppercase tracking-widest font-bold block mb-1">
                                    Raport Maszyny (Feedback)
                                  </span>
                                  <div 
                                    className="markdown-content bg-purple-950/40 border border-purple-900 p-4 text-purple-300 text-sm font-mono leading-relaxed max-w-none"
                                    dangerouslySetInnerHTML={{ __html: scoreData.feedback ? marked.parse(scoreData.feedback) as string : 'Brak raportu z ewaluacji.' }}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : !isCompleted && (
                            <div className="flex flex-col items-center justify-center text-center mt-6 p-4 border-2 border-dashed border-gray-800">
                              <Cpu className="w-4 h-4 text-gray-600 mb-2 animate-spin-slow" />
                              <span className="text-gray-500 uppercase tracking-widest font-bold text-[10px]">
                                Oczekiwanie na analizę systemu...
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
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
                    {topic.przedmiot} // Pytanie {topic.numer}
                  </div>
                </div>
                
                <div>
                  <span className="text-[10px] text-green-700 uppercase tracking-widest font-bold block mb-1">
                    Treść Pytania
                  </span>
                  <div className="bg-black/50 border border-dashed border-green-900 p-4 text-green-300 text-sm italic">
                    {topic.pytanie || 'Brak treści pytania w bazie.'}
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

        .markdown-content p { margin-bottom: 1rem; }
        .markdown-content p:last-child { margin-bottom: 0; }
        .markdown-content strong { color: #d8b4fe; font-weight: 900; }
        .markdown-content ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
        .markdown-content ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1rem; }
        .markdown-content li { margin-bottom: 0.25rem; }
        .markdown-content code { background-color: rgba(0, 0, 0, 0.5); padding: 0.1rem 0.3rem; border-radius: 2px; color: #e9d5ff; border: 1px solid rgba(168, 85, 247, 0.5); }
        .markdown-content pre code { background-color: transparent; border: none; padding: 0; color: inherit; }
        .markdown-content pre { background-color: rgba(0, 0, 0, 0.8); padding: 1rem; border: 1px dashed rgba(168, 85, 247, 0.5); overflow-x: auto; margin-bottom: 1rem; }
      `}</style>
    </main>
  );
}
