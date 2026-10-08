'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const subjects = [
  { id: 'matematyka', name: 'Matematyka', desc: 'Cyferki i równania', icon: 'M21.3 15.3l-9-9a2 2 0 0 0-2.8 0l-5.2 5.2a2 2 0 0 0 0 2.8l9 9a2 2 0 0 0 2.8 0l5.2-5.2a2 2 0 0 0 0-2.8zm-6.8-2.8 2-2m-3-3 2-2m-3-3 2-2' },
  { id: 'polski', name: 'Język Polski', desc: 'Lektury i pojęcia', icon: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5ZM6 6h10M6 10h10' },
  { id: 'geografia', name: 'Geografia', desc: '13 działów i 4 warianty', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm4.24-14.24-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z' },
  { id: 'chemia', name: 'Chemia', desc: '10 działów i 4 warianty', icon: 'M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2M8.5 2h7M7 16h10' },
  { id: 'fizyka', name: 'Fizyka', desc: '9 działów i 4 warianty', icon: 'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0-12a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2zm-10 10a15.3 15.3 0 0 1 10-4 15.3 15.3 0 0 1 10 4 15.3 15.3 0 0 1-10 4 15.3 15.3 0 0 1-10-4z' },
  { id: 'wf', name: 'WF', desc: 'Brak pytań', emoji: '⚽' },
  { id: 'biologia', name: 'Biologia', desc: 'Brak pytań', emoji: '🧬' },
  { id: 'historia', name: 'Historia', desc: 'Brak pytań', emoji: '📜' },
  { id: 'etyka', name: 'Etyka', desc: 'Brak pytań', emoji: '🤝' },
  { id: 'informatyka', name: 'Informatyka', desc: 'Brak pytań', emoji: '💻' },
];

export default function SubjectsPage() {
  const router = useRouter();

  const handleSubjectClick = (id: string) => {
    localStorage.setItem('selected_przedmiot', id);
    router.push(`/topics?przedmiot=${id}`);
  };

  return (
    <main className="min-h-screen p-3 sm:p-6 md:p-10 font-sketch flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Header with back button */}
        <div className="flex items-center gap-4 border-b-2 border-dashed border-slate-300 pb-4">
          <Link
            href="/"
            className="p-2 rounded-xl border-[2.5px] border-slate-900 bg-white hover:bg-slate-50 shadow-[3px_3px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            aria-label="Wróć"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-slate-900">
            Wybierz przedmiot
          </h1>
        </div>

        {/* Subjects Grid - 2 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => handleSubjectClick(sub.id)}
              className="group p-5 sm:p-6 rounded-2xl border-[3px] border-slate-900 text-left transition-all cursor-pointer bg-white hover:bg-amber-50 shadow-[4px_4px_0px_#0f172a] hover:shadow-[6px_6px_0px_#0f172a] hover:-translate-y-1 w-full"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl border-[2.5px] border-slate-900 bg-white flex items-center justify-center shadow-[3px_3px_0px_#0f172a] group-hover:scale-110 transition-transform">
                  {sub.emoji ? (
                    <span className="text-3xl">{sub.emoji}</span>
                  ) : (
                    <svg className="w-8 h-8 stroke-slate-900 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {sub.icon?.split('M').filter(Boolean).map((path, i) => (
                        <path key={i} d={`M${path}`} />
                      ))}
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-2xl tracking-wide group-hover:text-amber-700 transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-base font-bold text-slate-600 mt-1">
                    {sub.desc}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
