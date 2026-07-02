"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Howl } from "howler";
import { Play, Pause, Volume2, Info } from "lucide-react";

interface AudioPlayerProps {
  onPlayStateChange: (isPlaying: boolean) => void;
  onAudioEnded: () => void;
}

export function AudioPlayer({ onPlayStateChange, onAudioEnded }: AudioPlayerProps) {
  const [sound, setSound] = useState<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [duration, setDuration] = useState(0);
  const [seek, setSeek] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const animationFrameRef = useRef<number | null>(null);

  // Lazy initialization of Howler sound
  const initSound = useCallback(() => {
    if (sound) return sound;

    const audioUrl = "/audio/wilhelm.mp3";
    
    const newSound = new Howl({
      src: [audioUrl],
      preload: true,
      html5: false, // Forces Web Audio API for the analyser
      onload: () => {
        setIsLoaded(true);
        setDuration(newSound.duration());
      },
      onplay: () => {
        setIsPlaying(true);
        onPlayStateChange(true);
      },
      onpause: () => {
        setIsPlaying(false);
        onPlayStateChange(false);
      },
      onstop: () => {
        setIsPlaying(false);
        onPlayStateChange(false);
        setProgress(0);
        setSeek(0);
      },
      onend: () => {
        setIsPlaying(false);
        onPlayStateChange(false);
        setProgress(100);
        setSeek(newSound.duration());
        onAudioEnded();
      },
      onloaderror: (id, error) => {
        console.error("Howler load error:", error);
      },
      onplayerror: (id, error) => {
        console.error("Howler play error:", error);
      }
    });

    setSound(newSound);
    return newSound;
  }, [sound, onPlayStateChange, onAudioEnded]);

  // Handle Play / Pause trigger
  const handlePlayToggle = () => {
    const activeSound = initSound();
    if (isPlaying) {
      activeSound.pause();
    } else {
      // Resume AudioContext if browser suspended it (required by some browsers)
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        Howler.ctx.resume();
      }
      activeSound.play();
    }
  };

  // Track seek position and update progress
  useEffect(() => {
    if (!sound || !isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const updateSeek = () => {
      const currentSeek = sound.seek() as number;
      setSeek(currentSeek);
      if (duration > 0) {
        setProgress((currentSeek / duration) * 100);
      }
      animationFrameRef.current = requestAnimationFrame(updateSeek);
    };

    animationFrameRef.current = requestAnimationFrame(updateSeek);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sound, isPlaying, duration]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.stop();
        sound.unload();
      }
    };
  }, [sound]);

  // Format time (e.g. 0.45s)
  const formatTime = (time: number) => {
    return `${time.toFixed(2)}s`;
  };

  return (
    <div className="bg-zinc-950/60 border border-zinc-900 rounded-lg p-5 flex flex-col justify-between text-left space-y-4 shadow-md select-none h-36">
      {/* Header */}
      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">
        <span>// DECRYPTION CORE CONTROLS</span>
        <Volume2 size={12} className={isPlaying ? "text-emerald-500 animate-pulse" : "text-zinc-500"} />
      </div>

      {/* Center Row: Play Button & Progress bar */}
      <div className="flex items-center gap-4">
        {/* Play / Pause button */}
        <button
          type="button"
          onMouseEnter={initSound}
          onFocus={initSound}
          onClick={handlePlayToggle}
          className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
            isPlaying
              ? "bg-emerald-950/30 border-emerald-500/60 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              : "bg-zinc-950 border-zinc-800 hover:border-emerald-500/50 hover:text-emerald-400 text-zinc-400 cursor-pointer"
          }`}
          aria-label={isPlaying ? "Pause Scream" : "Play Scream"}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
        </button>

        {/* Progress & Time */}
        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
            <span>{isLoaded ? "wilhelm.mp3 (Decrypted)" : "wilhelm.mp3 (Preload Pending)"}</span>
            <span>
              {formatTime(seek)} / {formatTime(duration)}
            </span>
          </div>
          
          {/* Progress Bar Track */}
          <div className="w-full h-1.5 bg-zinc-900 border border-zinc-850/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Preload details */}
      <div className="flex items-center gap-1.5 text-[8px] text-zinc-500 font-mono">
        <Info size={10} />
        <span>
          {!isLoaded 
            ? "Hover play button to load resource context." 
            : "Audio context loaded successfully into memory."}
        </span>
      </div>
    </div>
  );
}

export default AudioPlayer;
