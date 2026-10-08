'use client';

interface TopRightNavProps {
  user: { email: string; name?: string | null; image?: string | null };
  tokens: number;
}

export default function TopRightNav({ user, tokens }: TopRightNavProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-[2.5px] border-slate-900 bg-white px-3 py-1.5 shadow-[4px_4px_0px_#0f172a] font-sketch">
      <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border-2 border-slate-900 px-2 py-0.5 text-xs font-bold text-slate-900 shadow-[2px_2px_0px_#0f172a]">
        <svg className="w-3.5 h-3.5 stroke-slate-900 fill-amber-300" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span className="font-bold text-sm">{tokens}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end min-w-0 hidden sm:flex">
          <span className="text-sm font-bold text-slate-900 truncate tracking-wide">
            {user.name || 'Uczeń'}
          </span>
        </div>
        
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="w-9 h-9 rounded-full border-2 border-slate-900 shrink-0"
          />
        ) : (
          <span
            aria-hidden="true"
            className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shrink-0 border-2 border-slate-900"
          >
            {(user.name || user.email).charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
