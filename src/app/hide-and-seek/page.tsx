'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Activity, ShieldAlert, Cpu, AlertTriangle, MonitorPlay, WifiOff } from 'lucide-react';

interface LiveStudentData {
  studentId: string;
  name: string;
  email: string;
  session: {
    id: string;
    status: string;
    createdAt: string;
    topic: string;
  } | null;
}

export default function HideAndSeekPage() {
  const [liveData, setLiveData] = useState<LiveStudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.role !== 'teacher')) {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchLive();
      // Polling every 5 seconds
      const intervalId = setInterval(fetchLive, 5000);
      return () => clearInterval(intervalId);
    }
  }, [status, session]);

  const fetchLive = async () => {
    try {
      const res = await fetch('/api/teacher/live');
      if (res.ok) {
        const data = await res.json();
        setLiveData(data.live);
        setLastUpdated(new Date());
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-black" />; // Black out during load
  }

  return (
    <main className="min-h-screen bg-[#050505] text-green-500 p-4 md:p-8 font-mono overflow-hidden relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#15803d 1px, transparent 1px), linear-gradient(90deg, #15803d 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      ></div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col h-full space-y-8">
        
        {/* Header - Evil Scientist Theme */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-gray-950/80 border border-green-500/50 p-6 rounded-none shadow-[0_0_20px_rgba(34,197,94,0.15)]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <ShieldAlert className="w-10 h-10 text-green-400" />
              <div className="absolute inset-0 w-10 h-10 bg-green-400 blur-xl opacity-50 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                Hide & Seek
              </h1>
              <p className="text-xs text-green-600 uppercase tracking-[0.2em] font-bold">
                Main Surveillance Console // Sys.Active
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-green-700 uppercase">Last Sync</span>
              <span className="text-sm text-green-400">{lastUpdated.toLocaleTimeString('pl-PL', { hour12: false })}</span>
            </div>
            
            <Link 
              href="/teacher/classes"
              className="px-6 py-2 border-2 border-green-600 text-green-500 hover:bg-green-600 hover:text-black uppercase text-sm font-bold tracking-widest transition-all shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]"
            >
              [ Terminate ]
            </Link>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-green-600">
              <Cpu className="w-16 h-16 animate-pulse mb-4" />
              <p className="uppercase tracking-[0.3em] text-sm font-bold">Initializing Surveillance Grid...</p>
            </div>
          ) : liveData.length === 0 ? (
            <div className="col-span-full border border-dashed border-green-900 bg-green-950/20 p-12 text-center flex flex-col items-center">
              <AlertTriangle className="w-12 h-12 text-green-800 mb-4" />
              <p className="uppercase text-green-700 tracking-widest text-lg">No Subjects Detected</p>
              <p className="text-green-800 text-xs mt-2">Verify class assignments in main panel.</p>
            </div>
          ) : (
            liveData.map((data) => {
              const isActive = data.session && ['active', 'monologue', 'qa', 'evaluating'].includes(data.session.status);
              const statusColor = isActive ? 'text-purple-400' : 'text-gray-500';
              const borderColor = isActive ? 'border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-green-900/40';
              const bgColor = isActive ? 'bg-purple-950/20' : 'bg-gray-950/50';

              return (
                <div
                  key={data.studentId}
                  className={`group relative border p-5 flex flex-col transition-all duration-500 ${borderColor} ${bgColor}`}
                >
                  {/* Subject Header */}
                  <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-2">
                    <div className="truncate pr-4">
                      <h3 className="font-bold text-gray-200 truncate uppercase tracking-wider text-sm">{data.name}</h3>
                      <p className="text-[10px] text-gray-500 truncate">{data.email}</p>
                    </div>
                    {isActive ? (
                      <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse shrink-0 shadow-[0_0_8px_rgba(168,85,247,1)]"></div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-700 shrink-0"></div>
                    )}
                  </div>

                  {/* Status Body */}
                  <div className="flex-1 flex flex-col justify-center">
                    {data.session ? (
                      <div className="space-y-3">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-gray-600 block mb-1">Status</span>
                          <div className={`flex items-center gap-2 font-bold uppercase text-xs tracking-wider ${statusColor}`}>
                            {isActive ? <Activity className="w-4 h-4 animate-pulse" /> : <MonitorPlay className="w-4 h-4" />}
                            {data.session.status}
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-gray-600 block mb-1">Current Subject</span>
                          <div className="text-gray-300 text-xs font-semibold truncate bg-gray-900/50 p-1.5 border border-gray-800">
                            {data.session.topic}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 opacity-40">
                        <WifiOff className="w-6 h-6 mb-2 text-gray-600" />
                        <span className="text-[10px] uppercase tracking-widest text-gray-500">Signal Lost</span>
                      </div>
                    )}
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-green-500/50"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-green-500/50"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-green-500/50"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-green-500/50"></div>
                </div>
              );
            })
          )}

        </div>
      </div>
    </main>
  );
}
