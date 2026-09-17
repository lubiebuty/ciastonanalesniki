'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FolderGit2, Plus, Users, ArrowRight, ShieldAlert, FlaskConical } from 'lucide-react';

interface ClassData {
  id: string;
  name: string;
  created_at: string;
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClassName, setNewClassName] = useState('');
  const [creating, setCreating] = useState(false);
  
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.role !== 'teacher')) {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchClasses();
    }
  }, [status, session]);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/teacher/classes');
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || creating) return;

    setCreating(true);
    try {
      const res = await fetch('/api/teacher/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName }),
      });
      
      if (res.ok) {
        setNewClassName('');
        fetchClasses();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-green-500 font-mono">
        <div className="flex flex-col items-center gap-4">
          <FlaskConical className="w-16 h-16 animate-pulse" />
          <p className="uppercase tracking-[0.3em] font-bold">Inicjalizacja Modułu Kontroli...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-green-500 p-4 md:p-8 font-mono overflow-hidden relative selection:bg-purple-500/30">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#15803d 1px, transparent 1px), linear-gradient(90deg, #15803d 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      ></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Header - Dexter Lab Style */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-gray-950/80 border-4 border-green-700 p-6 shadow-[0_0_20px_rgba(34,197,94,0.15)] relative">
          <div className="absolute top-0 left-0 w-4 h-4 bg-green-500 border-b-2 border-r-2 border-green-900"></div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-b-2 border-l-2 border-green-900"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-green-500 border-t-2 border-r-2 border-green-900"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-t-2 border-l-2 border-green-900"></div>

          <div className="flex items-center gap-4 w-full">
            <ShieldAlert className="w-10 h-10 text-green-500 animate-pulse" />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                Panel Kontrolny (Klasy)
              </h1>
              <p className="text-sm text-green-700 uppercase tracking-[0.2em] font-bold mt-1">
                Autoryzacja: {session?.user?.email} // ZATWIERDZONA
              </p>
            </div>

            <div className="hidden md:flex items-center">
              <Link 
                href="/hide-and-seek"
                className="px-6 py-2 border-2 border-purple-600 bg-purple-900/30 text-purple-400 hover:bg-purple-600 hover:text-black uppercase text-sm font-bold tracking-widest transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] flex items-center gap-2"
              >
                <MonitorPlay className="w-4 h-4" />
                Hide & Seek
              </Link>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Classes List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-950/90 border-4 border-green-900 flex flex-col h-[600px]">
              <div className="bg-green-950 border-b-2 border-green-900 p-3 flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-green-600">Baza_Grup.exe</span>
                <div className="w-16"></div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                {classes.length === 0 ? (
                  <div className="text-center py-12 text-green-800">
                    &gt; Brak wykrytych grup obiektów. Skonfiguruj nową klasę.
                  </div>
                ) : (
                  classes.map((c) => (
                    <Link 
                      href={`/teacher/classes/${c.id}`} 
                      key={c.id}
                      className="group border border-dashed border-green-900 bg-black/50 p-5 flex items-center justify-between hover:border-green-500 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-900 border-2 border-green-900 group-hover:border-green-500 transition-colors">
                          <FolderGit2 className="w-6 h-6 text-green-600 group-hover:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-black text-green-300 text-xl tracking-wider uppercase drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">
                            {c.name}
                          </h3>
                          <p className="text-xs text-green-700 font-bold tracking-[0.2em] mt-1">
                            Inicjalizacja: {new Date(c.created_at).toLocaleDateString('pl-PL')}
                          </p>
                        </div>
                      </div>
                      <div className="text-green-700 group-hover:text-green-400 group-hover:translate-x-2 transition-all">
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Create Class */}
          <div className="space-y-6">
            <div className="bg-gray-950/80 border-4 border-purple-900 p-6 relative">
              <div className="absolute -top-3 -right-3 bg-purple-600 text-black text-[10px] font-black uppercase px-2 py-1 transform rotate-12">
                Nowy Eksperyment
              </div>
              
              <h3 className="text-lg font-bold text-purple-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                <Plus className="w-5 h-5" /> Utwórz Klasę
              </h3>

              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label htmlFor="className" className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
                    Kryptonim Grupy
                  </label>
                  <input
                    type="text"
                    id="className"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="np. KLASA 3A"
                    className="w-full bg-black border-2 border-purple-900 text-purple-300 px-4 py-3 outline-none focus:border-purple-500 font-bold placeholder-purple-900/50 uppercase"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={creating || !newClassName.trim()}
                  className="w-full bg-purple-900/40 hover:bg-purple-600 border-2 border-purple-700 text-purple-400 hover:text-black font-black uppercase tracking-widest py-3 px-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                >
                  {creating ? 'Inicjalizowanie...' : 'Uruchom Proces'}
                </button>
              </form>
            </div>
            
            <Link 
              href="/hide-and-seek"
              className="md:hidden w-full px-6 py-4 border-2 border-purple-600 bg-purple-900/30 text-purple-400 hover:bg-purple-600 hover:text-black uppercase text-sm font-bold tracking-widest transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] flex justify-center items-center gap-2"
            >
              <MonitorPlay className="w-5 h-5" />
              Hide & Seek
            </Link>
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

function MonitorPlay(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="m10 10 5 3-5 3v-6Z" />
    </svg>
  );
}
