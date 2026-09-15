'use client';

import React from 'react';

interface SketchMicProps {
  isRecording: boolean;
  onToggleRecord: () => void;
  onToggleKeyboard?: () => void;
  showKeyboardToggle?: boolean;
  isKeyboardMode?: boolean;
  statusText?: string;
  disabled?: boolean;
}

/**
 * Hand-drawn microphone button and keyboard switch from pages 4, 5, 6.
 * Features:
 * - "NACIŚNIJ BY MÓWIĆ" prompt.
 * - Circular hand-drawn microphone.
 * - Animated ink ripple when recording.
 * - Miniature sketch keyboard icon in the corner.
 */
export default function SketchMic({
  isRecording,
  onToggleRecord,
  onToggleKeyboard,
  showKeyboardToggle = true,
  isKeyboardMode = false,
  statusText,
  disabled = false,
}: SketchMicProps) {
  return (
    <div className="relative flex flex-col items-center justify-center p-4 select-none">
      {/* Label above: NACIŚNIJ BY MÓWIĆ / NAGRYWANIE... */}
      <div className="text-center mb-3">
        <span className="font-bold text-lg sm:text-2xl tracking-wider text-slate-900 uppercase">
          {statusText || (isRecording ? 'NAGRYWANIE... (KLIKNIJ BY SKOŃCZYĆ)' : 'NACIŚNIJ BY MÓWIĆ')}
        </span>
      </div>

      {/* Main Circular Mic Button */}
      <div className="relative">
        {/* Pulsing ink ripple when active */}
        {isRecording && (
          <div className="absolute inset-0 rounded-full border-4 border-slate-900 animate-ping opacity-40 pointer-events-none" />
        )}

        <button
          type="button"
          onClick={onToggleRecord}
          disabled={disabled}
          className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3.5px] border-slate-900 flex items-center justify-center shadow-[4px_4px_0px_#0f172a] transition-all duration-150 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0f172a] disabled:opacity-50 ${
            isRecording
              ? 'bg-rose-500 text-white shadow-[2px_2px_0px_#0f172a]'
              : 'bg-white text-slate-900 hover:bg-slate-50'
          }`}
          aria-label={isRecording ? 'Zatrzymaj nagrywanie' : 'Rozpocznij nagrywanie'}
        >
          {/* Hand-drawn Microphone SVG Icon */}
          <svg
            viewBox="0 0 60 70"
            className="w-12 h-14 sm:w-14 sm:h-16 stroke-current fill-none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Mic capsule */}
            <rect x="22" y="10" width="16" height="28" rx="8" fill={isRecording ? '#ffffff' : '#ffffff'} />
            {/* Mic mesh lines */}
            <line x1="22" y1="22" x2="38" y2="22" strokeWidth="2" />
            <line x1="22" y1="28" x2="38" y2="28" strokeWidth="2" />
            {/* Cradle / U-shape wire */}
            <path d="M 14 26 C 14 44 46 44 46 26" strokeWidth="3.5" />
            {/* Stem */}
            <line x1="30" y1="44" x2="30" y2="56" strokeWidth="3.5" />
            {/* Stand Base */}
            <path d="M 18 56 Q 30 52 42 56" strokeWidth="3.5" />
          </svg>
        </button>
      </div>

      {/* Hand-drawn Keyboard Toggle Icon (bottom right corner like in screens 4, 5, 6) */}
      {showKeyboardToggle && onToggleKeyboard && (
        <button
          type="button"
          onClick={onToggleKeyboard}
          title={isKeyboardMode ? 'Przełącz na mikrofon' : 'Wpisz odpowiedź na klawiaturze'}
          className={`absolute right-4 bottom-2 p-2.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 shadow-[2px_2px_0px_#0f172a] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer ${
            isKeyboardMode ? 'ring-2 ring-slate-900 bg-amber-100' : ''
          }`}
        >
          {/* Sketch Keyboard SVG */}
          <svg
            viewBox="0 0 40 28"
            className="w-8 h-6 stroke-slate-900 fill-white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Keyboard body */}
            <rect x="2" y="2" width="36" height="24" rx="3" />
            {/* Key rows */}
            <circle cx="8" cy="8" r="1.5" fill="#0f172a" />
            <circle cx="14" cy="8" r="1.5" fill="#0f172a" />
            <circle cx="20" cy="8" r="1.5" fill="#0f172a" />
            <circle cx="26" cy="8" r="1.5" fill="#0f172a" />
            <circle cx="32" cy="8" r="1.5" fill="#0f172a" />

            <circle cx="10" cy="14" r="1.5" fill="#0f172a" />
            <circle cx="16" cy="14" r="1.5" fill="#0f172a" />
            <circle cx="22" cy="14" r="1.5" fill="#0f172a" />
            <circle cx="28" cy="14" r="1.5" fill="#0f172a" />

            {/* Spacebar */}
            <rect x="12" y="19" width="16" height="3" rx="1" fill="#0f172a" />
          </svg>
        </button>
      )}
    </div>
  );
}
