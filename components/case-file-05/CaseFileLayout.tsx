"use client";

import React from "react";
import { useCaseStore } from "./CaseFileProvider";
import { ProgressBar } from "./components/ProgressBar";
import { useAudio } from "@/components/AudioProvider";
import { Volume2, VolumeX } from "lucide-react";

interface CaseFileLayoutProps {
  children: React.ReactNode;
}

export function CaseFileLayout({ children }: CaseFileLayoutProps) {
  const activePuzzle = useCaseStore((state) => state.activePuzzle);
  const setActive = useCaseStore((state) => state.setActive);
  const { isMuted, toggleMute } = useAudio();

  return (
    <div className="min-h-screen w-full bg-[#050508] text-zinc-100 flex flex-col relative overflow-hidden font-sans scanlines">
      {/* Dynamic ambient grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.05),transparent_60%)] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md px-6 py-4 md:py-6 relative z-30 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Side: Title & Back Button */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex flex-col">
            <h1 className="font-serif text-lg tracking-[0.15em] text-zinc-100 font-bold uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
              Case-File-05
            </h1>
            <span className="font-mono text-[9px] tracking-wider text-emerald-500/70 uppercase">
              // Chronos Record
            </span>
          </div>
        </div>

        {/* Right Side: Progress Bar & Audio Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
          <ProgressBar />



          {/* Local Mute Toggle */}
          <button
            onClick={toggleMute}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-emerald-400 rounded-full cursor-pointer transition-all duration-300 shadow-md group relative"
            aria-label={isMuted ? "Unmute Ambient Audio" : "Mute Ambient Audio"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="animate-pulse" />}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-[9px] font-mono text-zinc-400 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-40">
              {isMuted ? "Unmute Audio" : "Mute Audio"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer / System Status */}
      <footer className="border-t border-zinc-900 bg-zinc-950/20 px-6 py-3 relative z-30 flex items-center justify-between text-[10px] font-mono text-zinc-600 select-none">
        <div>STATUS: SECURE CONNECTION</div>
        <div>STABILITY INDEX: 100%</div>
      </footer>
    </div>
  );
}

export default CaseFileLayout;
