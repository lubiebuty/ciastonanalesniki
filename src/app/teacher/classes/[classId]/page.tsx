'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { ArrowLeft, Users, Link as LinkIcon, Copy, CheckCircle2, ShieldAlert, Cpu, X, SortAsc, SortDesc, Filter, ExternalLink } from 'lucide-react';

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
  score: number;
}

type SortMode = 'alpha' | 'score_desc' | 'score_asc' | 'attempts_desc' | 'attempts_asc';

export default function ClassDetailsPage() {
  const params = useParams<{ classId: string }>();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [classScores, setClassScores] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showFullQR, setShowFullQR] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('alpha');
  
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

        // Fetch stats for basic averages
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

  const inviteLink = classData ? `${window.location.origin}/dolacz/${classData.invite_token}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-green-500 font-mono">
        <div className="flex flex-col items-center gap-4">
          <Cpu className="w-16 h-16 animate-pulse" />
          <p className="uppercase tracking-[0.3em] font-bold text-lg">Ładowanie bazy danych grupy...</p>
        </div>
      </div>
    );
  }

  if (!classData) return null;

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

  // Sort students based on selected mode
  const sortedStudents = [...enrichedStudents].sort((a, b) => {
    if (sortMode === 'score_desc') return b.avgScore - a.avgScore;
    if (sortMode === 'score_asc') return a.avgScore - b.avgScore;
    if (sortMode === 'attempts_desc') return b.attempts - a.attempts;
    if (sortMode === 'attempts_asc') return a.attempts - b.attempts;
    // fallback 'alpha'
    const nameA = a.name || a.email;
    const nameB = b.name || b.email;
    return nameA.localeCompare(nameB);
  });

  return (
    <main className="min-h-screen bg-[#050505] text-green-500 p-4 md:p-8 font-mono overflow-hidden relative selection:bg-purple-500/30">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#15803d 1px, transparent 1px), linear-gradient(90deg, #15803d 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      ></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8 pb-10">
        
        <header className="flex flex-col md:flex-row justify-between items-center bg-gray-950/80 border-4 border-green-700 p-6 shadow-[0_0_20px_rgba(34,197,94,0.15)] relative">
          <div className="absolute top-0 left-0 w-4 h-4 bg-purple-600 animate-pulse border-b-2 border-r-2 border-purple-900"></div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-purple-600 animate-pulse border-b-2 border-l-2 border-purple-900"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-purple-600 animate-pulse border-t-2 border-r-2 border-purple-900"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-purple-600 animate-pulse border-t-2 border-l-2 border-purple-900"></div>

          <div className="flex items-center gap-6 w-full">
            <Link 
              href="/teacher/classes"
              className="group p-3 bg-gray-900 border-2 border-green-700 hover:bg-green-700 hover:text-black transition-all shadow-[0_0_10px_rgba(34,197,94,0.3)]"
              title="Wróć do bazy grup"
            >
              <ArrowLeft className="w-8 h-8" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-10 h-10 text-purple-500" />
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                  Grupa: {classData.name}
                </h1>
              </div>
              <p className="text-base text-green-700 uppercase tracking-[0.2em] font-bold mt-1 pl-14">
                Kryptonim ID: {classData.id.slice(0, 8)} // ZARZĄDZANIE
              </p>
            </div>
            
            <div className="hidden md:flex flex-col items-end border-l-2 border-dashed border-green-800 pl-6">
              <span className="text-xs text-green-700 uppercase">Obiekty Przypisane</span>
              <span className="text-3xl font-bold text-purple-400">{students.length}</span>
            </div>
          </div>
        </header>

        {/* Link to Analytics Dashboard */}
        <Link 
          href={`/teacher/classes/${classData.id}/dashboard`}
          className="block w-full bg-blue-950/80 border-4 border-blue-600 hover:bg-blue-900 transition-colors p-8 relative overflow-hidden group shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] text-center cursor-pointer"
        >
          <div className="absolute inset-0 bg-blue-500/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          <div className="flex items-center justify-center gap-4 relative z-10">
            <Cpu className="w-10 h-10 text-blue-400 group-hover:animate-spin" />
            <span className="text-2xl md:text-3xl font-black uppercase tracking-[0.2em] text-blue-300 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
              [ Wejdź do Laboratorium (Dashboard) ]
            </span>
            <ExternalLink className="w-8 h-8 text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="mt-3 text-blue-500 font-bold uppercase tracking-widest text-sm relative z-10">
            Uzyskaj dostęp do raportów krytycznych, trendów i głębokiej analizy działów
          </p>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Students List with Rankings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-950/90 border-4 border-green-900 flex flex-col h-[700px]">
              
              <div className="bg-green-950 border-b-2 border-green-900 p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-sm font-bold tracking-[0.2em] uppercase text-green-600">Rejestr_Obiektow.exe</span>
                  <div className="w-16"></div>
                </div>
                
                {/* Sorting Controls */}
                <div className="flex flex-wrap items-center gap-3 bg-black/50 p-3 border border-green-900">
                  <span className="text-xs uppercase tracking-widest text-green-700 font-bold mr-2 flex items-center gap-1">
                    <Filter className="w-4 h-4" /> Sortowanie:
                  </span>
                  
                  <button 
                    onClick={() => setSortMode('alpha')}
                    className={`text-xs px-3 py-2 uppercase tracking-wider font-bold border transition-colors ${sortMode === 'alpha' ? 'bg-green-800 text-black border-green-500' : 'bg-transparent text-green-600 border-green-900 hover:border-green-600'}`}
                  >
                    Alfabetycznie
                  </button>
                  
                  <button 
                    onClick={() => setSortMode(sortMode === 'score_desc' ? 'score_asc' : 'score_desc')}
                    className={`text-xs px-3 py-2 uppercase tracking-wider font-bold border transition-colors flex items-center gap-1 ${sortMode.startsWith('score') ? 'bg-purple-900 text-purple-200 border-purple-500' : 'bg-transparent text-purple-600 border-purple-900 hover:border-purple-600'}`}
                  >
                    Wyniki (Moc) {sortMode === 'score_asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </button>

                  <button 
                    onClick={() => setSortMode(sortMode === 'attempts_desc' ? 'attempts_asc' : 'attempts_desc')}
                    className={`text-xs px-3 py-2 uppercase tracking-wider font-bold border transition-colors flex items-center gap-1 ${sortMode.startsWith('attempts') ? 'bg-blue-900 text-blue-200 border-blue-500' : 'bg-transparent text-blue-600 border-blue-900 hover:border-blue-600'}`}
                  >
                    Aktywność (Próby) {sortMode === 'attempts_asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                {sortedStudents.length === 0 ? (
                  <div className="text-center py-12 text-green-800 flex flex-col items-center">
                    <Users className="w-20 h-20 mb-4 opacity-50" />
                    <p className="tracking-[0.2em] font-bold uppercase text-lg">&gt; Brak obiektów w grupie.</p>
                    <p className="text-sm mt-2 text-green-900">Użyj protokołu zaproszenia, by zainicjować przypisanie.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm text-green-500 border-collapse">
                    <thead className="text-xs text-green-700 uppercase tracking-widest bg-black sticky top-0 z-10 border-b-2 border-green-900 shadow-md">
                      <tr>
                        <th className="px-6 py-5 font-black">Identyfikator (Obiekt)</th>
                        <th className="px-6 py-5 font-black text-center">Parametry Ewaluacji</th>
                        <th className="px-6 py-5 font-black text-center">Akcja</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-green-900/50">
                      {sortedStudents.map((student, index) => {
                        // Highlight extremes if sorted
                        const isTopScore = sortMode === 'score_desc' && index === 0 && student.attempts > 0;
                        const isBottomScore = sortMode === 'score_desc' && index === sortedStudents.length - 1 && student.attempts > 0;
                        
                        return (
                          <tr 
                            key={student.id} 
                            onClick={() => router.push(`/teacher/classes/${classData.id}/student/${student.id}`)}
                            className={`bg-black/40 hover:bg-green-900/30 transition-colors cursor-pointer group ${isTopScore ? 'bg-purple-950/20' : ''}`}
                          >
                            <td className="px-6 py-5">
                              <div className="font-bold text-green-300 text-base">{student.name || 'NIEZNANY_OBIEKT'}</div>
                              <div className="font-mono text-xs text-green-700 mt-1">{student.email}</div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-3 items-center justify-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs uppercase tracking-widest text-purple-600 font-bold">Moc:</span>
                                  <span className={`text-lg font-black ${isTopScore ? 'text-purple-300 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]' : isBottomScore ? 'text-red-500' : 'text-purple-400'}`}>
                                    {student.avgScore.toFixed(1)} <span className="text-xs text-purple-700">/ 10</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs uppercase tracking-widest text-blue-600 font-bold">Próby:</span>
                                  <span className="text-lg font-black text-blue-400">
                                    {student.attempts}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="inline-block border-2 border-green-900 bg-green-950/20 text-green-400 text-xs font-black uppercase px-4 py-2 group-hover:bg-green-700 group-hover:text-black transition-all tracking-widest shadow-[0_0_10px_rgba(34,197,94,0.1)] group-hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                                Wgląd
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Invite Code */}
          <div className="space-y-6">
            <div className="bg-gray-950/80 border-4 border-purple-900 p-6 relative flex flex-col items-center text-center">
              <div className="absolute -top-3 -left-3 bg-purple-600 text-black text-xs font-black uppercase px-3 py-1 transform -rotate-12 shadow-lg">
                Protokół Wcielenia
              </div>
              
              <h3 className="text-xl font-bold text-purple-400 mb-6 uppercase tracking-widest mt-2">
                Wymuś Dołączenie
              </h3>
              
              <div 
                className="bg-black border-4 border-purple-900 p-4 rounded-none shadow-[0_0_15px_rgba(168,85,247,0.2)] mb-6 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setShowFullQR(true)}
                title="Powiększ kod QR"
              >
                <QRCode 
                  value={inviteLink}
                  size={180}
                  level="Q"
                  className="mx-auto"
                  bgColor="#000000"
                  fgColor="#a855f7"
                />
              </div>

              <p className="text-sm text-purple-600 mb-6 uppercase tracking-widest font-bold">
                Skanuj, by zasilić szeregi eksperymentu.
              </p>

              <div className="w-full flex items-center bg-black border-2 border-purple-900 overflow-hidden group">
                <div className="p-3 text-purple-600 border-r-2 border-purple-900 bg-purple-950/30">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="bg-transparent text-xs text-purple-400 font-mono w-full px-3 py-3 outline-none selection:bg-purple-900"
                />
                <button 
                  onClick={copyToClipboard}
                  className="p-3 bg-purple-900/40 hover:bg-purple-700 text-purple-400 hover:text-black transition-colors border-l-2 border-purple-900"
                  title="Kopiuj strumień"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Fullscreen QR Modal */}
      {showFullQR && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-in fade-in duration-200"
          onClick={() => setShowFullQR(false)}
        >
          <div 
            className="bg-black border-4 border-purple-900 p-8 shadow-[0_0_50px_rgba(168,85,247,0.5)] flex flex-col items-center max-w-[90vw] max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center mb-6">
              <span className="text-purple-500 font-bold tracking-widest uppercase text-base">Protokół Przekazania</span>
              <button 
                onClick={() => setShowFullQR(false)}
                className="text-purple-500 hover:text-white transition-colors"
              >
                <X className="w-10 h-10" />
              </button>
            </div>
            <div className="bg-white p-6 w-full aspect-square flex items-center justify-center max-w-[600px] max-h-[600px]">
              <QRCode 
                value={inviteLink}
                size={500}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                level="Q"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <p className="mt-8 text-purple-400 uppercase tracking-widest font-bold text-center text-lg md:text-2xl">
              {inviteLink}
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #052e16; border-left: 2px solid #14532d; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #22c55e; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4ade80; }
      `}</style>
    </main>
  );
}
