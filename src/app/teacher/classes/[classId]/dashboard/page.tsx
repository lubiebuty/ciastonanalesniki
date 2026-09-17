'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, Cpu, BarChart2, Users } from 'lucide-react';

interface ClassData {
  id: string;
  name: string;
  invite_token: string;
}

interface StudentData {
  id: string;
  email: string;
  name: string | null;
  tokens: number;
}

interface ScoreData {
  id: string;
  created_at: string;
  user_id: string;
  topic_id: string;
  topic_numer: number | string;
  topic_przedmiot: string;
  topic_pytanie: string;
  topic_dzial_nazwa: string;
  topic_dzial_numer: number;
  topic_wariant: string;
  score: number;
}

export default function ClassDashboardPage() {
  const params = useParams<{ classId: string }>();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classScores, setClassScores] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.role !== 'teacher')) {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && params?.classId) {
      fetchClassDetails(params.classId);
    }
  }, [status, session, params]);

  const fetchClassDetails = async (classId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/teacher/classes/${classId}`);
      if (res.ok) {
        const data = await res.json();
        setClassData(data.class);
        setStudents(data.students);

        // Fetch stats
        const statsRes = await fetch(`/api/teacher/classes/${classId}/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setClassScores(statsData.scores || []);
        }
      } else {
        router.push('/teacher/classes');
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
          <p className="uppercase tracking-[0.3em] font-bold text-lg">Inicjowanie laboratorium analitycznego...</p>
        </div>
      </div>
    );
  }

  if (!classData) return null;

  const averageClassScore = classScores.length > 0 
    ? (classScores.reduce((acc, s) => acc + s.score, 0) / classScores.length).toFixed(1)
    : 0;

  // Group scores by Question (topic_id) to calculate class average per question
  const topicAverages = Object.values(
    classScores.reduce((acc, s) => {
      const tId = s.topic_id || 'unknown';
      if (!acc[tId]) {
        acc[tId] = { 
          topic_id: tId, 
          numer: s.topic_numer, 
          przedmiot: s.topic_przedmiot, 
          pytanie: s.topic_pytanie,
          totalScore: 0, 
          count: 0, 
          lastAttempt: new Date(s.created_at) 
        };
      }
      acc[tId].totalScore += s.score;
      acc[tId].count += 1;
      
      const sessionDate = new Date(s.created_at);
      if (sessionDate > acc[tId].lastAttempt) {
        acc[tId].lastAttempt = sessionDate;
      }
      return acc;
    }, {} as Record<string, { topic_id: string, numer: number|string, przedmiot: string, pytanie: string, totalScore: number, count: number, lastAttempt: Date }>)
  )
  .sort((a, b) => a.lastAttempt.getTime() - b.lastAttempt.getTime()) // Sort by when they were last attempted
  .map(topic => ({
    id: topic.topic_id,
    label: `${topic.przedmiot.substring(0, 3).toUpperCase()} Q${topic.numer}`,
    fullLabel: `Pytanie ${topic.numer} (${topic.przedmiot})`,
    pytanie: topic.pytanie,
    averageScore: Number((topic.totalScore / topic.count).toFixed(1)),
    sessionCount: topic.count
  }));

  const chartData = topicAverages.slice(-20); // show last 20 questions active

  // Analyze by Chapter (Dział) and Variants
  const chapterAnalysis = Object.values(
    classScores.reduce((acc, score) => {
      const chapterKey = score.topic_dzial_nazwa && score.topic_dzial_nazwa !== 'Nieznany dział' 
        ? `Dział ${score.topic_dzial_numer || '?'}: ${score.topic_dzial_nazwa}` 
        : `Pozostałe (${score.topic_przedmiot})`;

      if (!acc[chapterKey]) {
        acc[chapterKey] = {
          chapterName: chapterKey,
          studentIds: new Set<string>(),
          totalAttempts: 0,
          userTopicAttempts: {} as Record<string, ScoreData[]>
        };
      }
      
      acc[chapterKey].studentIds.add(score.user_id);
      acc[chapterKey].totalAttempts += 1;
      
      const key = `${score.user_id}_${score.topic_id}`;
      if (!acc[chapterKey].userTopicAttempts[key]) {
        acc[chapterKey].userTopicAttempts[key] = [];
      }
      acc[chapterKey].userTopicAttempts[key].push(score);

      return acc;
    }, {} as Record<string, { chapterName: string, studentIds: Set<string>, totalAttempts: number, userTopicAttempts: Record<string, ScoreData[]> }>)
  ).map(chapter => {
    const attemptsSummary: Record<number, { 
      sum: number, count: number, 
      variants: Record<string, { sum: number, count: number }> 
    }> = {};
    
    Object.values(chapter.userTopicAttempts).forEach(attempts => {
      const sorted = [...attempts].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      sorted.forEach((atmpt, index) => {
        const attemptNum = index + 1;
        if (!attemptsSummary[attemptNum]) {
          attemptsSummary[attemptNum] = { sum: 0, count: 0, variants: {} };
        }
        
        attemptsSummary[attemptNum].sum += atmpt.score;
        attemptsSummary[attemptNum].count += 1;

        const variant = atmpt.topic_wariant && atmpt.topic_wariant !== 'Brak' ? atmpt.topic_wariant : 'Inne';
        if (!attemptsSummary[attemptNum].variants[variant]) {
          attemptsSummary[attemptNum].variants[variant] = { sum: 0, count: 0 };
        }
        attemptsSummary[attemptNum].variants[variant].sum += atmpt.score;
        attemptsSummary[attemptNum].variants[variant].count += 1;
      });
    });

    const averages = Object.entries(attemptsSummary).map(([attemptNum, data]) => {
      const variantAvgs = Object.entries(data.variants).map(([v, vData]) => ({
        variant: v,
        averagePercentage: (vData.sum / vData.count) * 10,
        count: vData.count
      })).sort((a, b) => a.variant.localeCompare(b.variant));

      return {
        attempt: parseInt(attemptNum),
        averagePercentage: (data.sum / data.count) * 10,
        count: data.count,
        variants: variantAvgs
      };
    }).sort((a, b) => a.attempt - b.attempt);

    return {
      chapterName: chapter.chapterName,
      uniqueStudents: chapter.studentIds.size,
      totalAttempts: chapter.totalAttempts,
      averages
    };
  });

  // Enrich students with computed stats
  const enrichedStudents = students.map(student => {
    const studentScores = classScores.filter(s => s.user_id === student.id);
    const attempts = studentScores.length;
    const avgScore = attempts > 0 
      ? (studentScores.reduce((acc, s) => acc + s.score, 0) / attempts).toFixed(1) 
      : '0.0';
    return {
      ...student,
      attempts,
      avgScore: Number(avgScore)
    };
  });

  // Critical Insights logic
  const sortedTopics = [...topicAverages].sort((a, b) => b.averageScore - a.averageScore);
  const bestQuestions = sortedTopics.slice(0, 3);
  const worstQuestions = sortedTopics.slice(-3).reverse();

  const activeStudents = enrichedStudents.filter(s => s.attempts > 0);
  const worstStudents = [...activeStudents].sort((a, b) => a.avgScore - b.avgScore).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#050505] text-green-500 p-4 md:p-8 font-mono overflow-hidden relative selection:bg-purple-500/30">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#15803d 1px, transparent 1px), linear-gradient(90deg, #15803d 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      ></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8 pb-10">
        
        <header className="flex flex-col md:flex-row justify-between items-center bg-gray-950/80 border-4 border-blue-700 p-6 shadow-[0_0_20px_rgba(59,130,246,0.15)] relative">
          <div className="absolute top-0 left-0 w-4 h-4 bg-blue-600 animate-pulse border-b-2 border-r-2 border-blue-900"></div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-blue-600 animate-pulse border-b-2 border-l-2 border-blue-900"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-blue-600 animate-pulse border-t-2 border-r-2 border-blue-900"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-600 animate-pulse border-t-2 border-l-2 border-blue-900"></div>

          <div className="flex items-center gap-6 w-full">
            <Link 
              href={`/teacher/classes/${classData.id}`}
              className="group p-3 bg-gray-900 border-2 border-blue-700 hover:bg-blue-700 hover:text-black transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              title="Wróć do Rejestru Obiektów"
            >
              <ArrowLeft className="w-8 h-8" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Cpu className="w-10 h-10 text-blue-500" />
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                  Laboratorium: {classData.name}
                </h1>
              </div>
              <p className="text-base text-blue-700 uppercase tracking-[0.2em] font-bold mt-1 pl-14">
                Dashboard Analityczny
              </p>
            </div>
          </div>
        </header>

        {/* Critical Report (Raport Krytyczny) */}
        {(bestQuestions.length > 0 || worstStudents.length > 0) && (
          <div className="bg-gray-950/90 border-4 border-red-900 p-6 relative">
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 animate-ping m-2"></div>
            <h3 className="text-xl font-bold text-red-500 mb-6 uppercase tracking-widest flex items-center gap-3 border-b-2 border-red-900/50 pb-4">
              <ShieldAlert className="w-6 h-6 text-red-600" /> Raport_Krytyczny.exe
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Worst Students */}
              <div className="bg-black border border-red-900/50 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-900/10 rounded-bl-full pointer-events-none"></div>
                <h4 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 flex justify-between items-center">
                  <span>Zagrożone Obiekty</span>
                  <Users className="w-4 h-4 text-red-700" />
                </h4>
                {worstStudents.length > 0 ? (
                  <div className="space-y-3">
                    {worstStudents.map(student => (
                      <div key={student.id} className="flex flex-col bg-red-950/20 p-3 border-l-4 border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.1)]">
                        <span className="text-white font-bold truncate text-sm">{student.name || student.email}</span>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-red-400 uppercase tracking-widest">Średnia Moc:</span>
                          <span className="text-xl font-black text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">{student.avgScore.toFixed(1)}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-green-600 uppercase">Brak zagrożeń.</span>
                )}
              </div>

              {/* Worst Questions */}
              <div className="bg-black border border-orange-900/50 p-4">
                <h4 className="text-sm font-black text-orange-500 uppercase tracking-widest mb-4">
                  Krytyczne Luki (Najgorsze Z.)
                </h4>
                {worstQuestions.length > 0 ? (
                  <div className="space-y-3">
                    {worstQuestions.map(q => (
                      <div key={q.id} className="flex flex-col bg-orange-950/20 p-3 border-l-4 border-orange-600">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-orange-200 font-bold text-xs uppercase">{q.fullLabel}</span>
                          <span className="text-orange-500 font-black text-lg">{q.averageScore}/10</span>
                        </div>
                        <span className="text-[11px] text-orange-400/80 mt-1 line-clamp-2 italic leading-relaxed" title={q.pytanie}>
                          "{q.pytanie}"
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-green-600 uppercase">Brak danych.</span>
                )}
              </div>

              {/* Best Questions */}
              <div className="bg-black border border-green-900/50 p-4">
                <h4 className="text-sm font-black text-green-500 uppercase tracking-widest mb-4">
                  Sektory Opanowane (Top)
                </h4>
                {bestQuestions.length > 0 ? (
                  <div className="space-y-3">
                    {bestQuestions.map(q => (
                      <div key={q.id} className="flex flex-col bg-green-950/20 p-3 border-l-4 border-green-500">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-green-300 font-bold text-xs uppercase">{q.fullLabel}</span>
                          <span className="text-green-500 font-black text-lg">{q.averageScore}/10</span>
                        </div>
                        <span className="text-[11px] text-green-400/80 mt-1 line-clamp-2 italic leading-relaxed" title={q.pytanie}>
                          "{q.pytanie}"
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-green-600 uppercase">Brak danych.</span>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Global Progress Chart */}
        <div className="bg-gray-950/90 border-4 border-purple-900 p-8 relative mt-12">
          <h3 className="text-xl font-bold text-purple-400 mb-8 uppercase tracking-widest flex flex-col md:flex-row md:items-center justify-between border-b-2 border-purple-900/50 pb-4 gap-4">
            <span className="flex items-center gap-3">
              <BarChart2 className="w-6 h-6 text-purple-500" /> Trend Mocy Obliczeniowej Klasy
            </span>
            <span className="text-sm md:text-base bg-purple-900/30 px-4 py-2 border border-purple-800">
              Średnia Ogólna: <strong className="text-purple-300">{averageClassScore} / 10</strong>
            </span>
          </h3>
          
          {chartData.length > 0 ? (
            <>
              <div className="flex items-end justify-between h-48 gap-3 border-b-2 border-l-2 border-purple-900 pl-3 pb-3">
                {chartData.map((d, i) => {
                  const heightPercent = (d.averageScore / 10) * 100;
                  return (
                    <div key={d.id} className="relative flex-1 group flex flex-col items-center justify-end h-full">
                      <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-black border-4 border-purple-500 text-purple-300 text-base p-4 z-30 pointer-events-none shadow-[0_0_20px_rgba(168,85,247,0.4)] font-bold min-w-[300px] max-w-[450px]">
                        <div className="text-lg text-purple-300 mb-2">{d.fullLabel}</div>
                        <div className="font-mono text-base text-purple-400/90 italic mt-3 mb-3 border-l-4 border-purple-900 pl-3 font-normal leading-relaxed">
                          "{d.pytanie}"
                        </div>
                        <span className="text-purple-400 mt-2 block text-base bg-purple-950/50 p-2 border border-purple-900/50">
                          Średnia Klasy: <strong className="text-white text-lg">{d.averageScore}/10</strong> <span className="text-sm">({d.sessionCount} prób)</span>
                        </span>
                      </div>
                      <div 
                        className="w-full bg-purple-500/80 border-2 border-purple-400 hover:bg-purple-400 transition-colors relative"
                        style={{ height: `${heightPercent}%`, minHeight: '8px' }}
                      >
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-purple-700 font-bold whitespace-nowrap transform -rotate-45 hidden md:block">
                          Q{d.label.split(' Q')[1]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-8 text-xs text-purple-700 uppercase font-bold tracking-widest border-t-2 border-purple-900 pt-4">
                <span>Wcześniej Realizowane Zadania</span>
                <span>Ostatnio Realizowane Zadania</span>
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-purple-800 uppercase tracking-widest text-base font-bold border-2 border-dashed border-purple-900/50">
              Brak danych ewaluacyjnych do analizy trendu
            </div>
          )}
        </div>

        {/* Deep Subject (Dział) & Variant Analysis */}
        <div className="bg-gray-950/90 border-4 border-blue-900 p-8 relative mt-12">
          <h3 className="text-xl font-bold text-blue-400 mb-8 uppercase tracking-widest flex flex-col md:flex-row md:items-center justify-between border-b-2 border-blue-900/50 pb-4 gap-4">
            <span className="flex items-center gap-3">
              <Cpu className="w-6 h-6 text-blue-500" /> Głęboka Analiza Działów i Wariantów
            </span>
          </h3>
          
          {chapterAnalysis.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {chapterAnalysis.map(chapter => (
                <div key={chapter.chapterName} className="bg-black border-2 border-blue-900 p-6 flex flex-col relative">
                  <div className="absolute top-0 right-0 bg-blue-900/30 text-blue-400 text-xs font-black uppercase px-3 py-1 border-l-2 border-b-2 border-blue-900">
                    Aktywne Podejścia: {chapter.totalAttempts}
                  </div>
                  <h4 className="text-2xl font-black text-blue-300 uppercase tracking-widest mb-2 border-b border-blue-900/50 pb-2">
                    {chapter.chapterName}
                  </h4>
                  <p className="text-sm text-blue-600 font-bold uppercase tracking-[0.2em] mb-6">
                    Zaangażowanych Obiektów: <span className="text-blue-400 text-lg">{chapter.uniqueStudents}</span> z {students.length}
                  </p>
                  
                  <div className="space-y-6 flex-1">
                    {chapter.averages.slice(0, 3).map((avg: any) => (
                      <div key={avg.attempt} className="flex flex-col bg-blue-950/20 border border-blue-900/50 p-5 shadow-[0_0_10px_rgba(59,130,246,0.05)]">
                        <div className="flex items-center justify-between border-b-2 border-blue-900/30 pb-4 mb-4">
                          <span className="text-base uppercase font-bold tracking-widest text-blue-500">
                            Próba {avg.attempt} <span className="text-blue-800 text-xs ml-2">({avg.count} pytań łącznie)</span>
                          </span>
                          <div className="flex items-center gap-4">
                            <div className="w-32 md:w-48 h-3 bg-black border border-blue-900 overflow-hidden hidden sm:block">
                              <div 
                                className={`h-full ${avg.attempt === 1 ? 'bg-red-500' : avg.attempt === 2 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                style={{ width: `${avg.averagePercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-2xl font-black text-white w-16 text-right drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]">
                              {avg.averagePercentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {avg.variants.map((v: any) => (
                            <div key={v.variant} className="bg-black/50 border border-blue-900/40 p-3 flex flex-col relative group overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-blue-900 group-hover:bg-blue-500 transition-colors"></div>
                              <span className="text-xs text-blue-600 uppercase font-bold mb-1 pl-2 tracking-widest">
                                Wariant {v.variant}
                              </span>
                              <div className="flex items-center justify-between pl-2">
                                <span className="text-lg font-black text-blue-300">{v.averagePercentage.toFixed(0)}%</span>
                                <span className="text-[10px] text-blue-800 font-bold uppercase">({v.count})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {chapter.averages.length > 3 && (
                      <div className="text-xs text-blue-700 font-bold uppercase text-center mt-4 tracking-widest">
                        + Dalsze Próby Zarejestrowane w Bazie
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="h-48 flex items-center justify-center text-blue-800 uppercase tracking-widest text-base font-bold border-2 border-dashed border-blue-900/50">
              Brak danych do analizy działów i wariantów
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
