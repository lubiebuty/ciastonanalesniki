'use client';

import React from 'react';

interface RoadChoiceIllustrationProps {
  selectedRoad: 'with_us' | 'without_us';
  onSelectRoad: (road: 'with_us' | 'without_us') => void;
}

/**
 * Hand-drawn SVG illustration recreating Page 2 from the Wimpy Kid comic notebook:
 * - Left path: "DROGA Z NAMI" - smiling fruit tree, clear dashed path, Greg & Rowley.
 * - Right path: "DROGA BEZ NAS" - potted scrawny tree with black baubles, confusing tangled maze.
 */
export default function RoadChoiceIllustration({
  selectedRoad,
  onSelectRoad,
}: RoadChoiceIllustrationProps) {
  return (
    <div className="w-full select-none">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        {/* ===================================================================
            LEFT CARD: DROGA Z NAMI (Large Clickable Card)
            =================================================================== */}
        <button
          type="button"
          onClick={() => onSelectRoad('with_us')}
          aria-pressed={selectedRoad === 'with_us'}
          className={`w-full text-left rounded-2xl border-[2.5px] sm:border-[3px] p-2 sm:p-3.5 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
            selectedRoad === 'with_us'
              ? 'border-slate-900 bg-amber-100/80 shadow-[4px_4px_0px_#0f172a] scale-[1.01] ring-2 ring-slate-900'
              : 'border-slate-300 bg-white hover:bg-amber-50/50 hover:border-slate-700 shadow-[2px_2px_0px_#cbd5e1] opacity-80 hover:opacity-100'
          }`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between gap-1 w-full border-b border-dashed border-slate-300 pb-1 mb-1">
            <span className="font-extrabold text-xs sm:text-base uppercase tracking-wider text-slate-900">
              DROGA Z NAMI
            </span>
            <span
              className={`text-[9px] sm:text-xs font-extrabold px-1.5 py-0.5 rounded border ${
                selectedRoad === 'with_us'
                  ? 'border-slate-900 bg-amber-300 text-slate-950 shadow-[1px_1px_0px_#0f172a]'
                  : 'border-slate-300 bg-slate-100 text-slate-500'
              }`}
            >
              {selectedRoad === 'with_us' ? 'WYBRANO' : 'WYBIERZ'}
            </span>
          </div>

          {/* SVG Illustration (Left Half) */}
          <div className="w-full flex-1 flex items-center justify-center pointer-events-none py-1">
            <svg
              viewBox="20 30 260 450"
              className="w-full h-auto max-h-[175px] sm:max-h-[260px] drop-shadow-xs"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* SMILING TREE */}
              {/* Trunk */}
              <path
                d="M 120 280 Q 110 240 115 180 Q 118 120 100 80 L 140 50 L 180 80 Q 165 120 168 180 Q 172 240 185 280 Q 150 270 120 280 Z"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="3"
              />
              {/* Tree Roots */}
              <path d="M 125 265 Q 115 285 100 295" fill="none" stroke="#0f172a" strokeWidth="2" />
              <path d="M 175 265 Q 185 285 200 295" fill="none" stroke="#0f172a" strokeWidth="2" />

              {/* Tree Arm Waving (from page 2) */}
              <path
                d="M 112 180 Q 85 170 70 160 M 70 160 L 62 152 M 70 160 L 59 162 M 70 160 L 63 169"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
              />
              <path
                d="M 170 180 Q 195 195 210 205 M 210 205 L 218 200 M 210 205 L 219 208 M 210 205 L 215 214"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
              />

              {/* Tree Face */}
              <circle cx="132" cy="170" r="2.5" fill="#0f172a" />
              <circle cx="152" cy="170" r="2.5" fill="#0f172a" />
              <path d="M 130 182 Q 142 194 154 182" fill="none" stroke="#0f172a" strokeWidth="2.5" />

              {/* Tree Bark texture */}
              <path d="M 135 120 L 135 135" fill="none" stroke="#0f172a" strokeWidth="1.5" />
              <path d="M 150 215 L 150 230" fill="none" stroke="#0f172a" strokeWidth="1.5" />

              {/* Branches & Leaves */}
              <g stroke="#0f172a" strokeWidth="2.5" fill="#ffffff">
                <path d="M 75 90 C 55 65 75 45 95 65 C 115 45 135 65 120 90 Z" />
                <path d="M 125 65 C 115 25 155 15 170 40 C 185 15 225 25 215 65 Z" />
                <path d="M 180 90 C 165 65 185 45 205 65 C 225 45 245 65 230 90 Z" />
              </g>

              {/* Orange Fruits on Tree */}
              <circle cx="70" cy="100" r="8" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />
              <circle cx="102" cy="62" r="8" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />
              <circle cx="140" cy="45" r="8" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />
              <circle cx="172" cy="45" r="8" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />
              <circle cx="210" cy="65" r="8" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />
              <circle cx="236" cy="98" r="8" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />

              {/* CLEAR, DIRECT DASHED PATH FROM CHARACTERS TO FRUIT TREE */}
              <path
                d="M 235 440 Q 215 410 190 380 Q 155 340 150 290"
                fill="none"
                stroke="#0f172a"
                strokeWidth="3.5"
                strokeDasharray="8 8"
              />

              {/* CHARACTERS: GREG & ROWLEY */}
              {/* Greg */}
              <g transform="translate(205, 385) scale(0.75)" stroke="#0f172a" strokeWidth="2.5" fill="#ffffff">
                <path d="M 15 5 Q 12 -5 18 -12 M 22 5 Q 24 -7 28 -14 M 29 5 Q 35 -6 40 -10" fill="none" strokeWidth="2.5" />
                <circle cx="24" cy="18" r="16" />
                <path d="M 14 16 C 8 16 8 23 14 23" fill="#ffffff" strokeWidth="2" />
                <circle cx="20" cy="15" r="2.5" fill="#0f172a" stroke="none" />
                <path d="M 18 25 Q 24 28 29 24" fill="none" strokeWidth="2" />
                <rect x="16" y="34" width="16" height="30" rx="3" />
                <path d="M 16 38 L 8 52 M 32 38 L 36 50" fill="none" strokeWidth="2" />
                <path d="M 15 64 L 33 64 L 33 78 L 26 78 L 26 72 L 22 72 L 22 78 L 15 78 Z" fill="#0f172a" />
                <path d="M 18 78 L 18 94 M 29 78 L 29 94" fill="none" strokeWidth="2" />
                <ellipse cx="14" cy="95" rx="6" ry="2.5" fill="#0f172a" />
                <ellipse cx="25" cy="95" rx="6" ry="2.5" fill="#0f172a" />
              </g>

              {/* Rowley */}
              <g transform="translate(240, 390) scale(0.75)" stroke="#0f172a" strokeWidth="2.5" fill="#ffffff">
                <path d="M 8 5 L 8 -4 M 14 5 L 14 -5 M 20 5 L 20 -6 M 26 5 L 26 -5 M 32 5 L 32 -4" fill="none" strokeWidth="2.5" />
                <circle cx="20" cy="18" r="16" />
                <path d="M 12 22 Q 20 31 28 22 Z" fill="#ffffff" strokeWidth="2" />
                <line x1="20" y1="23" x2="20" y2="28" strokeWidth="1.5" />
                <circle cx="16" cy="15" r="2" fill="#0f172a" stroke="none" />
                <circle cx="24" cy="15" r="2" fill="#0f172a" stroke="none" />
                <rect x="10" y="34" width="20" height="28" rx="2" />
                <path d="M 10 62 L 30 62 L 30 76 L 22 76 L 22 70 L 18 70 L 18 76 L 10 76 Z" fill="#0f172a" />
                <path d="M 14 76 L 14 90 M 26 76 L 26 90" fill="none" strokeWidth="2" />
                <ellipse cx="12" cy="91" rx="5" ry="2" fill="#0f172a" />
                <ellipse cx="24" cy="91" rx="5" ry="2" fill="#0f172a" />
              </g>

              {/* Arrow pointing up-right toward path */}
              <path
                d="M 60 440 Q 95 430 130 420 M 130 420 L 118 412 M 130 420 L 123 430"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
              />
            </svg>
          </div>
        </button>

        {/* ===================================================================
            RIGHT CARD: DROGA BEZ NAS (Large Clickable Card)
            =================================================================== */}
        <button
          type="button"
          onClick={() => onSelectRoad('without_us')}
          aria-pressed={selectedRoad === 'without_us'}
          className={`w-full text-left rounded-2xl border-[2.5px] sm:border-[3px] p-2 sm:p-3.5 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
            selectedRoad === 'without_us'
              ? 'border-rose-900 bg-rose-100/85 shadow-[4px_4px_0px_#0f172a] scale-[1.01] ring-2 ring-rose-900'
              : 'border-slate-300 bg-white hover:bg-rose-50/40 hover:border-slate-700 shadow-[2px_2px_0px_#cbd5e1] opacity-80 hover:opacity-100'
          }`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between gap-1 w-full border-b border-dashed border-slate-300 pb-1 mb-1">
            <span className="font-extrabold text-xs sm:text-base uppercase tracking-wider text-slate-800">
              DROGA BEZ NAS
            </span>
            <span
              className={`text-[9px] sm:text-xs font-extrabold px-1.5 py-0.5 rounded border ${
                selectedRoad === 'without_us'
                  ? 'border-rose-900 bg-rose-200 text-rose-950 shadow-[1px_1px_0px_#0f172a]'
                  : 'border-slate-300 bg-slate-100 text-slate-500'
              }`}
            >
              {selectedRoad === 'without_us' ? 'WYBRANO' : 'WYBIERZ'}
            </span>
          </div>

          {/* SVG Illustration (Right Half) */}
          <div className="w-full flex-1 flex items-center justify-center pointer-events-none py-1">
            <svg
              viewBox="320 30 260 450"
              className="w-full h-auto max-h-[175px] sm:max-h-[260px] drop-shadow-xs"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Arrow pointing down */}
              <path
                d="M 450 40 L 450 70 M 450 70 L 442 60 M 450 70 L 458 60"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
              />

              {/* SCRAWNY THORNY TREE IN A POT (Page 2) */}
              <g transform="translate(410, 80)" stroke="#0f172a" strokeWidth="2.5" fill="#0f172a">
                <line x1="40" y1="10" x2="40" y2="120" strokeWidth="3" />
                <path d="M 40 30 L 20 40 M 40 30 L 60 40" />
                <path d="M 40 50 L 10 65 M 40 50 L 70 65" />
                <path d="M 40 70 L 5 90 M 40 70 L 75 90" />
                <path d="M 40 90 L 0 115 M 40 90 L 80 115" />

                <circle cx="15" cy="45" r="7" fill="#0f172a" />
                <circle cx="65" cy="45" r="7" fill="#0f172a" />
                <circle cx="8" cy="70" r="8" fill="#0f172a" />
                <circle cx="72" cy="70" r="8" fill="#0f172a" />
                <circle cx="2" cy="95" r="9" fill="#0f172a" />
                <circle cx="78" cy="95" r="9" fill="#0f172a" />

                <path
                  d="M 25 120 L 55 120 L 50 148 L 30 148 Z"
                  fill="#ffffff"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                />
              </g>

              {/* CONFUSING TANGLED LABYRINTH / MAZE DASHED PATH (Page 2) */}
              <path
                d="M 450 240
                   C 465 255, 490 265, 500 290
                   C 515 325, 470 345, 440 330
                   C 410 315, 400 360, 425 380
                   C 455 405, 520 365, 490 335
                   C 460 305, 380 305, 360 345
                   C 340 385, 370 420, 405 430
                   C 445 440, 485 425, 500 455
                   C 510 480, 450 490, 430 460"
                fill="none"
                stroke="#64748b"
                strokeWidth="3"
                strokeDasharray="6 6"
              />
              {/* Dead end marks */}
              <path d="M 365 335 L 365 350 M 358 342 L 372 342" stroke="#64748b" strokeWidth="2" />
              <path d="M 460 395 L 460 410 M 453 402 L 467 402" stroke="#64748b" strokeWidth="2" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
