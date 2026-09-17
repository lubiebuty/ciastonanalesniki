'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Activity, Cpu, Database, ShieldAlert, MonitorPlay, CheckCircle, BarChart2 } from 'lucide-react';

interface SessionData {
  id: string;
  topic_id: string;
  created_at: string;
  status: string;
  topics: {
    przedmiot: string;
    numer: number;
    pytanie: string;
  } | null;
  session_scores: any;
}

interface StudentProfile {
  id: string;
  name: string;
  email: string;
}

export default function StudentProgressPage() {
  const params = useParams<{ classId: string, studentId: string }>();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.role !== 'teacher')) {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && params?.classId && params?.studentId) {
      fetchProgress(params.classId, params.studentId);
    }
  }, [status, session, params]);

  const fetchProgress = async (classId: string, studentId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/teacher/classes/${classId}/student/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
        setSessions(data.sessions || []);
      } else {
        router.push(`/teacher/classes/${classId}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-green-500 font-mono">
        <div className="flex flex-col items-center gap-4">
          <Cpu className="w-16 h-16 animate-pulse" />
          <p className="uppercase tracking-[0.3em] font-bold">Ładowanie profilu obiektu badawczego...</p>
        </div>
      </div>
    );
  }

  if (!student) return null;

  const processedSessions = sessions.map(ses => {
    const scoreData = Array.isArray(ses.session_scores) ? ses.session_scores[0] : ses.session_scores;
    return {
      ...ses,
      score: scoreData?.score,
      is_correct: scoreData?.is_correct,
    };
  });

  const completedSessions = processedSessions.filter(s => s.status === 'completed' && s.score !== undefined);
  const averageScore = completedSessions.length > 0 
    ? (completedSessions.reduce((acc, s) => acc + (s.score || 0), 0) / completedSessions.length).toFixed(1)
    : 0;

  // Group by topic
  const groupedTopics = Object.values(
    processedSessions.reduce((acc, ses) => {
      if (!ses.topics || !ses.topic_id) return acc;
      
      const tId = ses.topic_id;
      if (!acc[tId]) {
        acc[tId] = {
          topic_id: tId,
          przedmiot: ses.topics.przedmiot,
          numer: ses.topics.numer,
          pytanie: ses.topics.pytanie,
          attemptsCount: 0,
          bestScore: -1,
          lastAttemptDate: ses.created_at,
          status: ses.status
        };
      }
      
      acc[tId].attemptsCount += 1;
      
      if (ses.score !== undefined && ses.score > acc[tId].bestScore) {
        acc[tId].bestScore = ses.score;
      }
      
      if (new Date(ses.created_at) > new Date(acc[tId].lastAttemptDate)) {
        acc[tId].lastAttemptDate = ses.created_at;
        acc[tId].status = ses.status;
      }
      
      return acc;
    }, {} as Record<string, any>)
  ).sort((a: any, b: any) => new Date(b.lastAttemptDate).getTime() - new Date(a.lastAttemptDate).getTime());

  // Chart data
  const chartData = completedSessions
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-20); // last 20 attempts

  return (
    <main className="min-h-screen bg-[#050505] text-green-500 p-4 md:p-8 font-mono overflow-hidden relative selection:bg-purple-500/30">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#15803d 1px, transparent 1px), linear-gradient(90deg, #15803d 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      ></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-6 pb-10">
        
        <header className="flex flex-col md:flex-row justify-between items-center bg-gray-950/80 border-4 border-green-700 p-6 shadow-[0_0_20px_rgba(34,197,94,0.15)] relative">
          <div className="absolute top-0 left-0 w-4 h-4 bg-purple-600 animate-pulse border-b-2 border-r-2 border-purple-900"></div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-purple-600 animate-pulse border-b-2 border-l-2 border-purple-900"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-purple-600 animate-pulse border-t-2 border-r-2 border-purple-900"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-purple-600 animate-pulse border-t-2 border-l-2 border-purple-900"></div>

          <div className="flex items-center gap-6 w-full">
            <Link 
              href={`/teacher/classes/${params?.classId}`}
              className="group p-3 bg-gray-900 border-2 border-green-700 hover:bg-green-700 hover:text-black transition-all shadow-[0_0_10px_rgba(34,197,94,0.3)]"
              title="Wróć do bazy"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-purple-500" />
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                  Obiekt: {student.name || 'Brak danych'}
                </h1>
              </div>
              <p className="text-sm text-green-700 uppercase tracking-[0.2em] font-bold mt-1 pl-11">
                ID: {student.email} // STATUS ZAAWANSOWANIA OBLICZONY
              </p>
            </div>
            <div className="hidden md:flex flex-col items-end border-l-2 border-dashed border-green-800 pl-6">
              <span className="text-[10px] text-green-700 uppercase">Ogólna Analiza</span>
              <span className="text-lg font-bold text-purple-400">DOSTĘP UZYSKANY</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-950/80 border-2 border-green-800 p-6 relative group overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
              <Database className="w-32 h-32 text-green-500" />
            </div>
            <p className="text-green-700 text-xs font-bold uppercase tracking-[0.2em] mb-2">Unikalne Zagadnienia</p>
            <p className="text-5xl font-black text-green-400">{groupedTopics.length}</p>
          </div>
          
          <div className="bg-purple-950/20 border-2 border-purple-800 p-6 relative group overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
              <Activity className="w-32 h-32 text-purple-500" />
            </div>
            <p className="text-purple-400/70 text-xs font-bold uppercase tracking-[0.2em] mb-2">Średnia Moc Obliczeniowa (Wynik)</p>
            <p className="text-5xl font-black text-purple-400">{averageScore} <span className="text-xl text-purple-700">/ 10</span></p>
          </div>
          
          <div className="bg-gray-950/80 border-2 border-green-800 p-6 relative group overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-32 h-32 text-green-500" />
            </div>
            <p className="text-green-700 text-xs font-bold uppercase tracking-[0.2em] mb-2">Zakończone Sukcesem Próby</p>
            <p className="text-5xl font-black text-green-400">{completedSessions.length}</p>
          </div>
        </div>

        {/* Progress Chart (Trend) */}
        {chartData.length > 0 && (
          <div className="bg-gray-950/90 border-4 border-purple-900 p-6 relative">
            <h3 className="text-lg font-bold text-purple-400 mb-6 uppercase tracking-widest flex items-center gap-2 border-b-2 border-purple-900/50 pb-4">
              <BarChart2 className="w-5 h-5 text-purple-500" /> Trend Mocy Obliczeniowej (Ostatnie próby)
            </h3>
            <div className="flex items-end justify-between h-40 gap-2 border-b-2 border-l-2 border-purple-900 pl-2 pb-2">
              {chartData.map((d, i) => {
                const heightPercent = (d.score! / 10) * 100;
                return (
                  <div key={d.id} className="relative flex-1 group flex flex-col items-center justify-end h-full">
                    {/* Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-purple-500 text-purple-300 text-[10px] p-2 whitespace-nowrap z-20 pointer-events-none">
                      Pytanie {d.topics?.numer}: {d.score}/10<br/>
                      {new Date(d.created_at).toLocaleDateString()}
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full bg-purple-500/80 border border-purple-400 hover:bg-purple-400 transition-colors"
                      style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-purple-700 uppercase font-bold tracking-widest">
              <span>Starsze</span>
              <span>Najnowsze</span>
            </div>
          </div>
        )}

        {/* Topics Terminal */}
        <div className="bg-gray-950/90 border-4 border-green-900 flex flex-col h-[500px]">
          <div className="bg-green-950 border-b-2 border-green-900 p-3 flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-green-600">Rejestr_Zadan.exe</span>
            <div className="w-16"></div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
            {groupedTopics.length === 0 ? (
              <div className="text-center py-12 text-green-800">
                &gt; Brak logów operacyjnych. Obiekt nie rozpoczął procedur.
              </div>
            ) : (
              groupedTopics.map((topic) => {
                const isCompleted = topic.status === 'completed';
                const hasScore = topic.bestScore > -1;
                
                return (
                  <Link 
                    href={`/teacher/classes/${params?.classId}/student/${params?.studentId}/topic/${topic.topic_id}`}
                    key={topic.topic_id} 
                    className="border border-dashed border-green-900 bg-black/50 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-green-500 hover:bg-green-950/20 transition-all group cursor-pointer relative"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                          isCompleted ? 'bg-purple-900/50 text-purple-400 border border-purple-700' : 'bg-gray-900 text-gray-500 border border-gray-700'
                        }`}>
                          &gt; {topic.status}
                        </span>
                        <span className="text-[10px] text-green-800 font-bold">
                          [ {new Date(topic.lastAttemptDate).toLocaleString('pl-PL')} ]
                        </span>
                        <span className="text-[10px] bg-green-900/40 text-green-400 border border-green-700 px-2 py-0.5 rounded-full ml-2">
                          Próby: {topic.attemptsCount}
                        </span>
                      </div>
                      <p className="font-bold text-green-300 text-sm">
                        {topic.przedmiot ? `${topic.przedmiot.toUpperCase()} :: PYTANIE ${topic.numer}` : 'BRAK KRYTERIUM'}
                      </p>
                      {topic.pytanie && (
                        <p className="text-green-600 text-xs mt-2 line-clamp-2 italic border-l-2 border-green-900 pl-2">
                          "{topic.pytanie}"
                        </p>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 w-full md:w-auto">
                      {hasScore ? (
                        <div className="flex items-center gap-4 border-2 border-purple-900 bg-purple-950/20 px-4 py-2 group-hover:bg-purple-900/40 transition-colors">
                          <div className="text-[10px] text-purple-500 font-bold uppercase tracking-[0.2em] leading-tight">
                            Max <br/> Wynik
                          </div>
                          <div className="text-2xl font-black text-purple-300">
                            {topic.bestScore} <span className="text-xs text-purple-700">/10</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[10px] text-green-700 font-bold uppercase tracking-[0.2em] border-2 border-dashed border-green-900 px-4 py-3">
                          <MonitorPlay className="w-4 h-4 animate-pulse" />
                          Przetwarzanie...
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #052e16; border-left: 2px solid #14532d; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #22c55e; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4ade80; }
      `}</style>
    </main>
  );
}
