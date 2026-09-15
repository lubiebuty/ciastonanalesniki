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
    <div className="w-full max-w-2xl mx-auto select-none">
      <svg
        viewBox="0 0 600 520"
        className="w-full h-auto drop-shadow-sm"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* ===================================================================
            LEFT SIDE: DROGA Z NAMI (Friendly Tree & Clear Path)
            =================================================================== */}
        <g
          className="cursor-pointer transition-transform duration-150 hover:scale-[1.01]"
          onClick={() => onSelectRoad('with_us')}
        >
          {/* Active outline aura if selected */}
          {selectedRoad === 'with_us' && (
            <rect
              x="15"
              y="10"
              width="275"
              height="490"
              rx="16"
              fill="#fef3c7"
              fillOpacity="0.4"
              stroke="#0f172a"
              strokeWidth="2.5"
              strokeDasharray="6 6"
            />
          )}

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

          {/* CHARACTERS: GREG & ROWLEY (Standing at the start of the path) */}
          {/* Greg */}
          <g transform="translate(230, 395) scale(0.75)" stroke="#0f172a" strokeWidth="2.5" fill="#ffffff">
            {/* 3 Spiky hairs */}
            <path d="M 15 5 Q 12 -5 18 -12 M 22 5 Q 24 -7 28 -14 M 29 5 Q 35 -6 40 -10" fill="none" strokeWidth="2.5" />
            {/* Head */}
            <circle cx="24" cy="18" r="16" />
            {/* Big round nose */}
            <path d="M 14 16 C 8 16 8 23 14 23" fill="#ffffff" strokeWidth="2" />
            {/* Eye */}
            <circle cx="20" cy="15" r="2.5" fill="#0f172a" stroke="none" />
            {/* Smirk */}
            <path d="M 18 25 Q 24 28 29 24" fill="none" strokeWidth="2" />
            {/* Neck & Torso */}
            <rect x="16" y="34" width="16" height="30" rx="3" />
            {/* Arms */}
            <path d="M 16 38 L 8 52 M 32 38 L 36 50" fill="none" strokeWidth="2" />
            {/* Shorts */}
            <path d="M 15 64 L 33 64 L 33 78 L 26 78 L 26 72 L 22 72 L 22 78 L 15 78 Z" fill="#0f172a" />
            {/* Legs */}
            <path d="M 18 78 L 18 94 M 29 78 L 29 94" fill="none" strokeWidth="2" />
            {/* Shoes */}
            <ellipse cx="14" cy="95" rx="6" ry="2.5" fill="#0f172a" />
            <ellipse cx="25" cy="95" rx="6" ry="2.5" fill="#0f172a" />
          </g>

          {/* Rowley */}
          <g transform="translate(265, 400) scale(0.75)" stroke="#0f172a" strokeWidth="2.5" fill="#ffffff">
            {/* Straight fringe hair */}
            <path d="M 8 5 L 8 -4 M 14 5 L 14 -5 M 20 5 L 20 -6 M 26 5 L 26 -5 M 32 5 L 32 -4" fill="none" strokeWidth="2.5" />
            {/* Round Head */}
            <circle cx="20" cy="18" r="16" />
            {/* Wide smiling mouth with teeth */}
            <path d="M 12 22 Q 20 31 28 22 Z" fill="#ffffff" strokeWidth="2" />
            <line x1="20" y1="23" x2="20" y2="28" strokeWidth="1.5" />
            {/* Eyes */}
            <circle cx="16" cy="15" r="2" fill="#0f172a" stroke="none" />
            <circle cx="24" cy="15" r="2" fill="#0f172a" stroke="none" />
            {/* Shirt */}
            <rect x="10" y="34" width="20" height="28" rx="2" />
            {/* Shorts */}
            <path d="M 10 62 L 30 62 L 30 76 L 22 76 L 22 70 L 18 70 L 18 76 L 10 76 Z" fill="#0f172a" />
            {/* Legs & Shoes */}
            <path d="M 14 76 L 14 90 M 26 76 L 26 90" fill="none" strokeWidth="2" />
            <ellipse cx="12" cy="91" rx="5" ry="2" fill="#0f172a" />
            <ellipse cx="24" cy="91" rx="5" ry="2" fill="#0f172a" />
          </g>

          {/* "DROGA Z NAMI" Text & Arrow */}
          <g transform="translate(60, 430)">
            {/* Hand-drawn arrow pointing up-right toward path */}
            <path
              d="M 30 18 Q 60 5 95 -5 M 95 -5 L 82 -12 M 95 -5 L 88 5"
              fill="none"
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            <text
              x="0"
              y="40"
              className="font-sketch font-extrabold text-2xl fill-slate-900 tracking-wider"
            >
              DROGA Z NAMI
            </text>
          </g>
        </g>

        {/* ===================================================================
            RIGHT SIDE: DROGA BEZ NAS (Thorny Tree & Tangled Maze)
            =================================================================== */}
        <g
          className="cursor-pointer transition-transform duration-150 hover:scale-[1.01]"
          onClick={() => onSelectRoad('without_us')}
        >
          {/* Active outline aura if selected */}
          {selectedRoad === 'without_us' && (
            <rect
              x="315"
              y="10"
              width="270"
              height="490"
              rx="16"
              fill="#f1f5f9"
              fillOpacity="0.5"
              stroke="#64748b"
              strokeWidth="2.5"
              strokeDasharray="6 6"
            />
          )}

          {/* "DROGA BEZ NAS" Text & Downward Arrow */}
          <g transform="translate(340, 60)">
            <text
              x="0"
              y="20"
              className="font-sketch font-extrabold text-2xl fill-slate-800 tracking-wider"
            >
              DROGA BEZ NAS
            </text>
            {/* Arrow pointing down */}
            <path
              d="M 185 25 L 185 48 M 185 48 L 178 40 M 185 48 L 192 40"
              fill="none"
              stroke="#0f172a"
              strokeWidth="2.5"
            />
          </g>

          {/* SCRAWNY THORNY TREE IN A POT (Page 2) */}
          <g transform="translate(420, 100)" stroke="#0f172a" strokeWidth="2.5" fill="#0f172a">
            {/* Trunk */}
            <line x1="40" y1="10" x2="40" y2="120" strokeWidth="3" />
            {/* Spiky pine-like branches */}
            <path d="M 40 30 L 20 40 M 40 30 L 60 40" />
            <path d="M 40 50 L 10 65 M 40 50 L 70 65" />
            <path d="M 40 70 L 5 90 M 40 70 L 75 90" />
            <path d="M 40 90 L 0 115 M 40 90 L 80 115" />

            {/* Black baubles / rotten fruits (Page 2) */}
            <circle cx="15" cy="45" r="7" fill="#0f172a" />
            <circle cx="65" cy="45" r="7" fill="#0f172a" />
            <circle cx="8" cy="70" r="8" fill="#0f172a" />
            <circle cx="72" cy="70" r="8" fill="#0f172a" />
            <circle cx="2" cy="95" r="9" fill="#0f172a" />
            <circle cx="78" cy="95" r="9" fill="#0f172a" />

            {/* Plant pot */}
            <path
              d="M 25 120 L 55 120 L 50 148 L 30 148 Z"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="2.5"
            />
          </g>

          {/* CONFUSING TANGLED LABYRINTH / MAZE DASHED PATH (Page 2) */}
          <path
            d="M 460 255
               C 475 270, 500 280, 510 305
               C 525 340, 480 360, 450 345
               C 420 330, 410 375, 435 395
               C 465 420, 530 380, 500 350
               C 470 320, 390 320, 370 360
               C 350 400, 380 435, 415 445
               C 455 455, 495 440, 510 470
               C 520 495, 460 505, 440 475"
            fill="none"
            stroke="#64748b"
            strokeWidth="3"
            strokeDasharray="6 6"
          />
          {/* Dead end marks */}
          <path d="M 375 350 L 375 365 M 368 357 L 382 357" stroke="#64748b" strokeWidth="2" />
          <path d="M 470 410 L 470 425 M 463 417 L 477 417" stroke="#64748b" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}
