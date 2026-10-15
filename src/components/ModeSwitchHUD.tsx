"use client";

import { Eye, Box, Sparkles } from "lucide-react";

interface ModeSwitchHUDProps {
  isStudioMode: boolean;
  onToggleMode: (studioMode: boolean) => void;
}

export default function ModeSwitchHUD({
  isStudioMode,
  onToggleMode,
}: ModeSwitchHUDProps) {
  return (
    <div className="flex items-center p-1 bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl">
      <button
        onClick={() => onToggleMode(false)}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
          !isStudioMode
            ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            : "text-slate-400 hover:text-white"
        }`}
      >
        <Eye className="w-3.5 h-3.5" />
        <span>WebXR AR</span>
        {!isStudioMode && (
          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
        )}
      </button>

      <button
        onClick={() => onToggleMode(true)}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
          isStudioMode
            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            : "text-slate-400 hover:text-white"
        }`}
      >
        <Box className="w-3.5 h-3.5" />
        <span>3D Studio</span>
        {isStudioMode && (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
        )}
      </button>
    </div>
  );
}
