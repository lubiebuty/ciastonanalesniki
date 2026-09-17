'use client';

import React from 'react';
import Link from 'next/link';
import { ZAWODY } from '@/lib/doradca';
import { Creepster } from 'next/font/google';

const creepster = Creepster({ weight: '400', subsets: ['latin'] });

export default function DoradcaPage() {
  const powazne = ZAWODY.filter(z => z.kategoria === 'powazny');
  const zartobliwe = ZAWODY.filter(z => z.kategoria === 'zartobliwy');
  const bgImages = ['/images/bg1.png', '/images/bg2.png', '/images/bg3.png', '/images/bg4.png', '/images/bg5.png'];

  return (
    <main className={`min-h-screen p-2.5 sm:p-6 md:p-10 flex flex-col justify-start relative z-0 ${creepster.className}`}>
      {/* Główne Tło z wygenerowanej grafiki */}
      <div 
        className="fixed inset-0 pointer-events-none z-[-1] bg-[#0a0a0a] bg-center bg-cover bg-no-repeat bg-fixed opacity-95"
        style={{ backgroundImage: "url('/images/doradca_bg.jpg')" }}
      />

      <div className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-10 animate-in fade-in duration-300 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xl sm:text-2xl font-black text-slate-900 border-4 border-black bg-white hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_#000]"
          >
            ← WSTECZ
          </Link>
          <span className="text-xl sm:text-2xl font-black uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 border-4 border-black bg-white shadow-[4px_4px_0px_#000]">
            DORADCA ZAWODOWY
          </span>
        </div>

        {/* Header */}
        <div className="text-center space-y-8 relative">
          <div className="relative flex flex-col items-center justify-center py-16 sm:py-20 w-full max-w-4xl mx-auto">
            {/* Product Ads Scattered Behind the Text */}
            <img src="/images/item2.png" alt="Ad" className="absolute w-[40%] sm:w-[35%] -rotate-12 top-[-10%] left-[-20%] sm:left-[-15%] z-0 drop-shadow-xl opacity-95" />
            <img src="/images/item1.png" alt="Ad" className="absolute w-[45%] sm:w-[40%] rotate-6 top-[-15%] right-[-15%] z-0 drop-shadow-xl opacity-95" />
            <img src="/images/item4.png" alt="Ad" className="absolute w-[55%] sm:w-[50%] top-[5%] left-[10%] z-0 drop-shadow-xl opacity-95" />
            <img src="/images/item3.png" alt="Ad" className="absolute w-[45%] sm:w-[40%] rotate-12 bottom-[0%] right-[-25%] sm:right-[-15%] z-0 drop-shadow-xl opacity-95" />
            
            <img src="/images/item2.png" alt="Ad" className="absolute w-[35%] sm:w-[30%] rotate-[20deg] bottom-[-15%] left-[-15%] z-0 drop-shadow-xl opacity-95" />
            <img src="/images/item1.png" alt="Ad" className="absolute w-[40%] sm:w-[35%] -rotate-[15deg] top-[30%] left-[-25%] z-0 drop-shadow-xl opacity-95" />
            <img src="/images/item3.png" alt="Ad" className="absolute w-[35%] sm:w-[30%] -rotate-[30deg] top-[20%] right-[15%] z-0 drop-shadow-xl opacity-95" />
            <img src="/images/item4.png" alt="Ad" className="absolute w-[40%] sm:w-[35%] rotate-3 bottom-[25%] left-[30%] z-0 drop-shadow-xl opacity-95" />

            <img src="/images/item3.png" alt="Ad" className="absolute w-[30%] sm:w-[25%] rotate-[45deg] top-[-5%] left-[35%] z-0 drop-shadow-xl opacity-95" />
            <img src="/images/item2.png" alt="Ad" className="absolute w-[35%] sm:w-[30%] -rotate-[40deg] top-[50%] right-[0%] z-0 drop-shadow-xl opacity-95" />
            <img src="/images/item1.png" alt="Ad" className="absolute w-[45%] sm:w-[40%] rotate-[10deg] bottom-[-20%] left-[10%] z-0 drop-shadow-xl opacity-95" />
            <img src="/images/item4.png" alt="Ad" className="absolute w-[50%] sm:w-[45%] -rotate-6 bottom-[-10%] right-[10%] z-0 drop-shadow-xl opacity-95" />
            <img src="/images/item2.png" alt="Ad" className="absolute w-[40%] sm:w-[35%] rotate-[25deg] top-[15%] left-[60%] z-0 drop-shadow-xl opacity-95" />
            <img src="/images/item1.png" alt="Ad" className="absolute w-[30%] sm:w-[25%] -rotate-[20deg] bottom-[40%] left-[-5%] z-0 drop-shadow-xl opacity-95" />
            <img src="/images/item3.png" alt="Ad" className="absolute w-[40%] sm:w-[35%] rotate-[5deg] top-[75%] right-[-20%] z-0 drop-shadow-xl opacity-95" />
            <img src="/images/item4.png" alt="Ad" className="absolute w-[35%] sm:w-[30%] -rotate-[8deg] top-[60%] left-[-30%] z-0 drop-shadow-xl opacity-95" />

            <img src="/images/dice_header_transparent.png" alt="DICE DORADCA ZAWODOWY DICE" className="relative z-10 w-full max-w-xl sm:max-w-3xl mx-auto rotate-1 hover:-rotate-1 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
          </div>
          
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 max-w-2xl mx-auto bg-white/90 p-3 border-4 border-black border-dashed shadow-[4px_4px_0px_#000] relative z-10">
            Siema ziomalu jestem Igor. Ja wybrałem swoją ścieżkę DICE. Ty też wybierz swoją.
          </p>
        </div>

        {/* Poważne Zawody */}
        <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 space-y-6 border-4 border-black shadow-[8px_8px_0px_#000]">
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-slate-900 border-b-4 border-dashed border-black pb-2">
            POWAŻNE KARIERY
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {powazne.map((zawod, i) => (
              <Link key={zawod.id} href={`/doradca/${zawod.id}`} className="group block h-full">
                <div className="relative h-full border-4 border-black p-4 flex flex-col items-center justify-center gap-2 bg-white hover:bg-gray-100 transition-all shadow-[4px_4px_0px_#000] group-hover:shadow-[8px_8px_0px_#000] group-hover:-translate-y-2 overflow-hidden">
                  
                  {/* DICE Clothing Image Background */}
                  <div 
                    className="absolute inset-0 opacity-15 bg-center bg-cover bg-no-repeat mix-blend-multiply pointer-events-none transition-transform group-hover:scale-110" 
                    style={{ backgroundImage: `url(${bgImages[i % bgImages.length]})` }} 
                  />

                  <span className="relative z-10 text-5xl sm:text-6xl drop-shadow-sm group-hover:scale-125 transition-transform">
                    {zawod.ikonaEmoji}
                  </span>
                  <span className="relative z-10 text-xl sm:text-2xl font-black text-slate-900 text-center leading-tight tracking-widest mt-2 bg-white/50 px-2 py-1 rounded">
                    {zawod.nazwa}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Żartobliwe Zawody */}
        <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 space-y-6 border-4 border-black shadow-[8px_8px_0px_#000]">
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-slate-900 border-b-4 border-dashed border-black pb-2 text-rose-700">
            KIEDYŚ ZIOMAL Z EKIPY PRÓBOWAŁ.
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {zartobliwe.map((zawod, i) => (
              <Link key={zawod.id} href={`/doradca/${zawod.id}`} className="group block h-full">
                <div className="relative h-full border-4 border-black p-4 flex flex-col items-center justify-center gap-2 bg-white hover:bg-rose-50 transition-all shadow-[4px_4px_0px_#000] group-hover:shadow-[8px_8px_0px_#e11d48] group-hover:-translate-y-2 overflow-hidden">
                  
                  {/* DICE Clothing Image Background */}
                  <div 
                    className="absolute inset-0 opacity-20 bg-center bg-cover bg-no-repeat mix-blend-multiply pointer-events-none transition-transform group-hover:scale-110" 
                    style={{ backgroundImage: `url(${bgImages[(i + powazne.length) % bgImages.length]})` }} 
                  />

                  <span className="relative z-10 text-5xl sm:text-6xl drop-shadow-sm group-hover:scale-125 transition-transform animate-pulse">
                    {zawod.ikonaEmoji}
                  </span>
                  <span className="relative z-10 text-xl sm:text-2xl font-black text-rose-950 text-center leading-tight tracking-widest mt-2 bg-white/50 px-2 py-1 rounded">
                    {zawod.nazwa}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
