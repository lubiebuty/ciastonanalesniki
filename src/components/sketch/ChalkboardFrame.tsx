'use client';

import React from 'react';

interface ChalkboardFrameProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

/**
 * Hand-drawn 3D beveled frame inspired by pages 3, 4, 5, 6 of the sketch design.
 * Features an outer wobbly border, inner frame, and perspective corner lines.
 */
export default function ChalkboardFrame({ children, className = '', title }: ChalkboardFrameProps) {
  return (
    <div className={`relative p-3.5 sm:p-5 bg-white border-[3px] border-slate-900 shadow-[5px_5px_0px_#0f172a] rounded-sm ${className}`}>
      {/* Corner perspective diagonal lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-900 stroke-[2] overflow-visible">
        <line x1="0" y1="0" x2="14" y2="14" />
        <line x1="100%" y1="0" x2="calc(100% - 14px)" y2="14" />
        <line x1="0" y1="100%" x2="14" y2="calc(100% - 14px)" />
        <line x1="100%" y1="100%" x2="calc(100% - 14px)" y2="calc(100% - 14px)" />
      </svg>

      {/* Inner frame */}
      <div className="relative border-2 border-slate-900 bg-white/90 p-2.5 sm:p-6 z-10">
        {title && (
          <div className="text-center font-bold text-lg sm:text-xl tracking-wide uppercase border-b-2 border-dashed border-slate-300 pb-2 mb-3">
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
