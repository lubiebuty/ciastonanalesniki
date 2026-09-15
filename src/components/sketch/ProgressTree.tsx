'use client';

import React from 'react';

interface ProgressTreeProps {
  currentStep?: number;
  totalSteps?: number;
  className?: string;
  signText?: string;
  hasFace?: boolean;
}

/**
 * Hand-drawn Tree of Knowledge from pages 2, 4, 5.
 * Features trunk ladder steps, orange fruits, smiling face on the bark, and chalkboard signs.
 */
export default function ProgressTree({
  currentStep = 1,
  totalSteps = 5,
  className = '',
  signText,
  hasFace = true,
}: ProgressTreeProps) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 400"
        className="w-full h-auto max-h-[360px] stroke-slate-900 fill-white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* ===================== TREE TRUNK & ROOTS ===================== */}
        <path
          d="M 125 390 Q 110 395 90 398 L 105 375 Q 118 300 120 220 Q 122 140 100 80 L 160 40 L 220 80 Q 198 140 200 220 Q 202 300 215 375 L 230 398 Q 210 395 195 390 Q 160 380 125 390 Z"
          fill="#ffffff"
          strokeWidth="3"
        />

        {/* Tree Roots Texture lines */}
        <path d="M 135 360 Q 130 385 110 395" fill="none" strokeWidth="2" />
        <path d="M 160 365 L 160 388" fill="none" strokeWidth="2" />
        <path d="M 185 360 Q 190 385 210 395" fill="none" strokeWidth="2" />

        {/* ===================== BRANCHES & LEAVES ===================== */}
        {/* Left branch */}
        <path
          d="M 112 160 Q 70 140 40 100 Q 55 90 75 105 L 110 135"
          fill="#ffffff"
          strokeWidth="2.5"
        />
        {/* Right branch */}
        <path
          d="M 208 160 Q 250 140 280 100 Q 265 90 245 105 L 210 135"
          fill="#ffffff"
          strokeWidth="2.5"
        />

        {/* Top foliage leaves */}
        <g strokeWidth="2.5">
          {/* Leaves cluster top-left */}
          <path d="M 50 100 C 30 75 55 55 75 75 C 95 55 120 75 100 100 Z" fill="#ffffff" />
          {/* Leaves cluster center */}
          <path d="M 110 70 C 100 30 140 20 160 45 C 180 20 220 30 210 70 Z" fill="#ffffff" />
          {/* Leaves cluster top-right */}
          <path d="M 220 100 C 200 75 225 55 245 75 C 265 55 290 75 270 100 Z" fill="#ffffff" />
        </g>

        {/* ===================== ORANGE FRUIT REWARDS ===================== */}
        {/* Left fruits */}
        <circle cx="55" cy="115" r="9" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="85" cy="75" r="9" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />
        {/* Center fruits */}
        <circle cx="145" cy="55" r="9" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="175" cy="55" r="9" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />
        {/* Right fruits */}
        <circle cx="235" cy="75" r="9" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="265" cy="115" r="9" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />

        {/* ===================== TREE FACE (from page 2) ===================== */}
        {hasFace && (
          <g strokeWidth="2">
            {/* Left eye */}
            <circle cx="145" cy="170" r="3" fill="#0f172a" stroke="none" />
            {/* Right eye */}
            <circle cx="175" cy="170" r="3" fill="#0f172a" stroke="none" />
            {/* Smile */}
            <path d="M 142 185 Q 160 200 178 185" fill="none" strokeWidth="2.5" />
            {/* Tree arm waving (page 2) */}
            <path d="M 120 180 Q 90 170 75 160 M 75 160 L 68 152 M 75 160 L 65 162 M 75 160 L 68 168" fill="none" strokeWidth="2.5" />
          </g>
        )}

        {/* ===================== LADDER STEPS ON TRUNK (Progress) ===================== */}
        {/* Step 1 */}
        <rect
          x="135"
          y="320"
          width="50"
          height="10"
          rx="2"
          fill={currentStep >= 1 ? '#0f172a' : '#ffffff'}
          strokeWidth="2.5"
        />
        {/* Step 2 */}
        <rect
          x="140"
          y="280"
          width="48"
          height="10"
          rx="2"
          fill={currentStep >= 2 ? '#0f172a' : '#ffffff'}
          strokeWidth="2.5"
        />
        {/* Step 3 */}
        <rect
          x="138"
          y="240"
          width="46"
          height="10"
          rx="2"
          fill={currentStep >= 3 ? '#0f172a' : '#ffffff'}
          strokeWidth="2.5"
        />
        {/* Step 4 */}
        <rect
          x="142"
          y="200"
          width="44"
          height="10"
          rx="2"
          fill={currentStep >= 4 ? '#0f172a' : '#ffffff'}
          strokeWidth="2.5"
        />
        {/* Step 5 */}
        <rect
          x="140"
          y="150"
          width="42"
          height="10"
          rx="2"
          fill={currentStep >= 5 ? '#0f172a' : '#ffffff'}
          strokeWidth="2.5"
        />

        {/* Tree Bark Details (vertical sketch lines) */}
        <path d="M 148 215 L 148 230" fill="none" strokeWidth="1.5" />
        <path d="M 172 255 L 172 270" fill="none" strokeWidth="1.5" />
        <path d="M 152 295 L 152 310" fill="none" strokeWidth="1.5" />

        {/* Optional Signpost nailed to tree (from page 5) */}
        {signText && (
          <g transform="translate(195, 210)">
            <rect
              x="0"
              y="0"
              width="95"
              height="36"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="2"
              rx="1"
            />
            {/* Nail */}
            <circle cx="6" cy="18" r="1.5" fill="#0f172a" />
            <text
              x="48"
              y="22"
              textAnchor="middle"
              className="fill-slate-900 font-bold text-[9px] uppercase"
              stroke="none"
            >
              {signText.slice(0, 18)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
