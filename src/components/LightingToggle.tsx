"use client";

import { Sun, Moon } from "lucide-react";

interface LightingToggleProps {
  currentHdri: string;
  onSelectHdri: (hdriPath: string) => void;
}

export const LIGHTING_PRESETS = [
  {
    id: "daylight",
    label: "Daylight",
    path: "/hdri/daylight_studio.hdr",
    icon: Sun,
    colorClass: "text-amber-400",
    bgActive: "bg-amber-500/20 border-amber-500/40 text-amber-200",
  },
  {
    id: "warm_evening",
    label: "Warm Evening",
    path: "/hdri/warm_evening.hdr",
    icon: Moon,
    colorClass: "text-indigo-400",
    bgActive: "bg-indigo-500/20 border-indigo-500/40 text-indigo-200",
  },
];

export default function LightingToggle({
  currentHdri,
  onSelectHdri,
}: LightingToggleProps) {
  const isNight = currentHdri.includes("warm_evening");

  const toggle = () => {
    if (isNight) {
      onSelectHdri(LIGHTING_PRESETS[0].path);
    } else {
      onSelectHdri(LIGHTING_PRESETS[1].path);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 p-1 rounded-2xl shadow-xl">
      <button
        onClick={toggle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
          !isNight
            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="Daylight Environment Map"
      >
        <Sun className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">Day</span>
      </button>

      <button
        onClick={toggle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
          isNight
            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="Warm Evening Environment Map"
      >
        <Moon className="w-3.5 h-3.5 text-indigo-400" />
        <span className="hidden sm:inline">Night</span>
      </button>
    </div>
  );
}
