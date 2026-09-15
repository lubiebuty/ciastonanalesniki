'use client';

import React from 'react';

interface WimpyRobotProps {
  message?: string;
  className?: string;
}

/**
 * Hand-drawn computer/robot Bob with a jagged comic speech bubble from Page 1.
 */
export default function WimpyRobot({
  message = 'HEJ, BOB, MIŁO CIĘ POZNAĆ, BOB.',
  className = '',
}: WimpyRobotProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 ${className}`}>
      {/* Robot Figure */}
      <div className="relative shrink-0 select-none">
        <svg
          viewBox="0 0 140 160"
          className="w-28 h-32 sm:w-36 sm:h-40 stroke-slate-900 fill-white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Antenna */}
          <line x1="70" y1="20" x2="70" y2="4" />
          <circle cx="70" cy="4" r="3" fill="#0f172a" />

          {/* Head */}
          <rect x="35" y="20" width="70" height="48" rx="4" />
          {/* Eyes */}
          <circle cx="53" cy="40" r="7" />
          <circle cx="53" cy="40" r="3" fill="#0f172a" />
          <circle cx="87" cy="40" r="7" />
          <circle cx="87" cy="40" r="3" fill="#0f172a" />
          {/* Mouth (zigzag/wobbly) */}
          <path d="M 47 55 Q 52 50, 58 55 T 70 55 T 82 55 T 93 55" fill="none" strokeWidth="2" />
          {/* Ears / screws */}
          <rect x="27" y="38" width="8" height="12" rx="2" fill="#0f172a" />
          <rect x="105" y="38" width="8" height="12" rx="2" fill="#0f172a" />

          {/* Neck */}
          <rect x="62" y="68" width="16" height="8" />

          {/* Body / Computer Box */}
          <rect x="25" y="76" width="90" height="56" rx="4" />
          {/* Screen / chest plate */}
          <rect x="36" y="86" width="68" height="24" rx="2" fill="#f8fafc" />
          <text
            x="70"
            y="102"
            textAnchor="middle"
            className="fill-slate-900 font-bold font-mono text-[10px]"
            stroke="none"
          >
            AI BOB
          </text>

          {/* Keyboard */}
          <rect x="42" y="136" width="56" height="16" rx="2" fill="#ffffff" />
          <line x1="45" y1="142" x2="95" y2="142" strokeDasharray="3 3" />
          <line x1="45" y1="147" x2="95" y2="147" strokeDasharray="3 3" />

          {/* Arms / Claws */}
          {/* Left arm */}
          <path d="M 25 88 L 12 100 L 12 120 L 25 125" fill="none" strokeWidth="3" />
          {/* Right arm */}
          <path d="M 115 88 L 128 100 L 128 120 L 115 125" fill="none" strokeWidth="3" />
        </svg>
      </div>

      {/* Jagged / Comic Speech Bubble */}
      <div className="relative bg-white border-[2.5px] border-slate-900 p-4 sm:p-5 rounded-2xl shadow-[4px_4px_0px_#0f172a] max-w-sm">
        {/* Pointer arrow to the left on desktop, top on mobile */}
        <div className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-slate-900" />
        <div className="hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[9px] border-r-white z-10" />

        <p className="font-bold text-slate-900 text-sm sm:text-base tracking-wide leading-relaxed uppercase">
          {message}
        </p>
      </div>
    </div>
  );
}
