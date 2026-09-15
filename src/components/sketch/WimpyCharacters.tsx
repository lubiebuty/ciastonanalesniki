'use client';

import React from 'react';

interface WimpyCharactersProps {
  className?: string;
  pose?: 'standing' | 'looking_up' | 'happy';
  scale?: number;
}

/**
 * Hand-drawn Wimpy Kid style characters (Greg & Rowley).
 * Handcrafted pure vector SVG with ink line art styling from the sketches.
 */
export default function WimpyCharacters({ className = '', pose = 'standing' }: WimpyCharactersProps) {
  return (
    <div className={`inline-flex items-end justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 160 140"
        className="w-28 h-24 sm:w-36 sm:h-32 stroke-slate-900 fill-white overflow-visible"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* ===================== BOY 1: GREG STYLE (Left) ===================== */}
        <g transform="translate(10, 5)">
          {/* Hair (3 strands) */}
          <path d="M 30 18 Q 28 8 26 4" fill="none" />
          <path d="M 34 16 Q 34 6 35 2" fill="none" />
          <path d="M 38 18 Q 40 8 44 5" fill="none" />

          {/* Head (round) */}
          <circle cx="35" cy="30" r="14" />
          {/* Nose */}
          <path d="M 45 30 Q 52 30 46 35" fill="none" />
          {/* Eye */}
          <circle cx="41" cy="27" r="1.5" fill="#0f172a" />
          {/* Mouth (small line or smile) */}
          <path d="M 38 38 Q 42 41 45 38" fill="none" />
          {/* Ear */}
          <circle cx="21" cy="30" r="2.5" />

          {/* Neck */}
          <line x1="33" y1="44" x2="33" y2="49" />
          <line x1="37" y1="44" x2="37" y2="49" />

          {/* Body / Shirt */}
          <path d="M 26 49 L 44 49 L 45 78 L 25 78 Z" fill="#ffffff" />

          {/* Arms */}
          {pose === 'looking_up' ? (
            <path d="M 26 52 Q 20 62 28 72" fill="none" />
          ) : (
            <path d="M 26 52 Q 22 65 26 74" fill="none" />
          )}
          <path d="M 44 52 Q 48 65 44 74" fill="none" />

          {/* Shorts */}
          <path d="M 25 78 L 45 78 L 46 95 L 36 95 L 35 86 L 34 95 L 24 95 Z" fill="#0f172a" />

          {/* Legs */}
          <line x1="29" y1="95" x2="29" y2="120" strokeWidth="2.5" />
          <line x1="41" y1="95" x2="41" y2="120" strokeWidth="2.5" />

          {/* Shoes */}
          <path d="M 24 120 C 24 120 29 116 35 120 Z" fill="#0f172a" />
          <path d="M 36 120 C 36 120 41 116 47 120 Z" fill="#0f172a" />
        </g>

        {/* ===================== BOY 2: ROWLEY STYLE (Right) ===================== */}
        <g transform="translate(75, 12)">
          {/* Hair (spiky fringe across forehead) */}
          <path d="M 23 20 L 25 12 L 28 19 L 31 11 L 34 19 L 37 12 L 40 19 L 43 13 L 45 20" fill="none" />

          {/* Head (wider, chubby) */}
          <circle cx="34" cy="30" r="15" />

          {/* Eyes (round open circles with dots) */}
          <circle cx="31" cy="27" r="3" />
          <circle cx="31" cy="27" r="1.2" fill="#0f172a" />
          <circle cx="41" cy="27" r="3" />
          <circle cx="41" cy="27" r="1.2" fill="#0f172a" />

          {/* Nose */}
          <circle cx="36" cy="32" r="1.5" fill="none" />

          {/* Big happy open mouth */}
          <path d="M 28 35 Q 36 44 44 35 Z" fill="#0f172a" />

          {/* Neck */}
          <line x1="31" y1="45" x2="31" y2="49" />
          <line x1="37" y1="45" x2="37" y2="49" />

          {/* Body / T-Shirt */}
          <path d="M 23 49 L 47 49 L 48 76 L 22 76 Z" fill="#ffffff" />

          {/* Arms */}
          <path d="M 23 52 Q 18 64 22 72" fill="none" />
          <path d="M 47 52 Q 52 64 48 72" fill="none" />

          {/* Shorts */}
          <path d="M 22 76 L 48 76 L 49 92 L 36 92 L 35 84 L 34 92 L 21 92 Z" fill="#0f172a" />

          {/* Legs */}
          <line x1="27" y1="92" x2="27" y2="114" strokeWidth="2.5" />
          <line x1="43" y1="92" x2="43" y2="114" strokeWidth="2.5" />

          {/* Shoes */}
          <path d="M 22 114 C 22 114 27 110 33 114 Z" fill="#0f172a" />
          <path d="M 38 114 C 38 114 43 110 49 114 Z" fill="#0f172a" />
        </g>
      </svg>
    </div>
  );
}
