"use client";

import { useState } from "react";
import { SuggestedProduct, BoundingBox2D } from "../types/neurocommerce";
import {
  MapPin,
  Compass,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface SpatialPlacementHUDProps {
  roomImage: string | null;
  primaryProduct: SuggestedProduct;
  alternativeProducts?: SuggestedProduct[];
  roomType?: string;
  wallColor?: string;
  lightingCondition?: string;
  onSelectProduct?: (product: SuggestedProduct) => void;
  onSwitchTo3D?: () => void;
}

export default function SpatialPlacementHUD({
  roomImage,
  primaryProduct,
  alternativeProducts = [],
  roomType = "living room",
  wallColor = "warm sand",
  lightingCondition = "bright daylight",
  onSelectProduct,
  onSwitchTo3D,
}: SpatialPlacementHUDProps) {
  const [activeSkuId, setActiveSkuId] = useState<string>(primaryProduct.sku_id);

  const allItems = [primaryProduct, ...alternativeProducts];
  const activeItem =
    allItems.find((item) => item.sku_id === activeSkuId) || primaryProduct;

  const rawBox: BoundingBox2D =
    activeItem.bounding_box_2d || {
      ymin: 350,
      xmin: 220,
      ymax: 750,
      xmax: 780,
    };

  // Convert [0, 1000] normalized coords to percentage with mobile-safe clamping
  // Keeps the holographic box cleanly framed in the visible central room zone
  const rawTop = (rawBox.ymin / 1000) * 100;
  const rawLeft = (rawBox.xmin / 1000) * 100;
  const rawWidth = ((rawBox.xmax - rawBox.xmin) / 1000) * 100;
  const rawHeight = ((rawBox.ymax - rawBox.ymin) / 1000) * 100;

  // Clamped safe area for mobile portrait viewports
  const topPct = Math.max(16, Math.min(50, rawTop));
  const heightPct = Math.max(24, Math.min(38, rawHeight));
  const leftPct = Math.max(8, Math.min(25, rawLeft));
  const widthPct = Math.max(50, Math.min(84, rawWidth));

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center select-none">
      {/* Background Room Scan Keyframe */}
      {roomImage ? (
        <img
          src={roomImage}
          alt="Scanned Room"
          className="absolute inset-0 w-full h-full object-cover filter brightness-90 contrast-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-center p-6 text-slate-500 font-mono text-xs">
            <Compass className="w-8 h-8 text-cyan-400 mx-auto mb-2 animate-spin" />
            <span>Scanning Room Geometry...</span>
          </div>
        </div>
      )}

      {/* Futuristic Spatial Holographic Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(6,182,212,0.18)_0%,transparent_70%)] pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top Telemetry Chip */}
      <div className="absolute top-14 sm:top-16 left-3 sm:left-4 z-20 flex flex-col gap-1 max-w-xs pointer-events-none">
        <div className="px-2.5 py-1 rounded-xl bg-slate-900/85 border border-cyan-500/40 backdrop-blur-xl shadow-xl flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-white">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <span className="font-bold tracking-wide uppercase text-cyan-300">
            Spatial Clearance Blueprint
          </span>
          <span className="text-slate-400">• 1:1 Scale</span>
        </div>
        <div className="px-2.5 py-0.5 rounded-lg bg-slate-950/70 border border-slate-800/80 backdrop-blur-md text-[9px] font-mono text-slate-300 flex items-center gap-1.5">
          <span>Room: <strong className="text-white capitalize">{roomType.replace("_", " ")}</strong></span>
          <span>•</span>
          <span>Wall: <strong className="text-amber-200 capitalize">{wallColor}</strong></span>
        </div>
      </div>

      {/* Single Active Holographic Bounding Box (NO overlapping clutter) */}
      <div
        className="absolute z-20 transition-all duration-500 pointer-events-auto cursor-pointer"
        style={{
          top: `${topPct}%`,
          left: `${leftPct}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
        }}
        onClick={() => {
          if (onSelectProduct) onSelectProduct(activeItem);
        }}
      >
        {/* Animated Cyan Laser Border */}
        <div className="w-full h-full relative rounded-2xl border-2 border-cyan-400 bg-cyan-500/10 shadow-[0_0_35px_rgba(6,182,212,0.45)] flex flex-col justify-between p-2">
          {/* Corner Crosshair Brackets */}
          <span className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-cyan-300" />
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-cyan-300" />
          <span className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-cyan-300" />
          <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-cyan-300" />

          {/* Floating Dimension Header Badge */}
          <div className="absolute -top-11 left-0 bg-slate-900/95 border border-cyan-400/90 backdrop-blur-xl px-2.5 py-1 rounded-xl shadow-2xl flex items-center gap-1.5 whitespace-nowrap max-w-[90vw] overflow-hidden">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="flex flex-col truncate">
              <span className="text-[11px] font-bold text-white tracking-tight truncate">
                {activeItem.item_name}
              </span>
              <span className="text-[9px] font-mono text-cyan-300">
                {activeItem.dimensions_meters.width}m W × {activeItem.dimensions_meters.depth}m D × {activeItem.dimensions_meters.height}m H
              </span>
            </div>
          </div>

          {/* Floor Target Reticle */}
          <div className="m-auto flex items-center justify-center">
            <div className="w-9 h-9 rounded-full border border-dashed border-cyan-300/80 flex items-center justify-center animate-spin">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            </div>
          </div>

          {/* Bottom Footprint Clearance Fit Tag */}
          <div className="self-center bg-slate-950/90 border border-emerald-400/70 rounded-md px-2 py-0.5 text-[9px] font-mono text-emerald-300 flex items-center gap-1 shadow-md">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Optimal Fit • 0.6m Walkway Clear</span>
          </div>
        </div>
      </div>

      {/* Clean Interactive Room Suite Selector (Replaces overlapping stacked boxes) */}
      {allItems.length > 1 && (
        <div className="absolute bottom-20 sm:bottom-24 inset-x-0 mx-auto w-fit max-w-[96vw] z-30 px-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl pointer-events-auto">
          <span className="text-[10px] font-mono text-cyan-400 font-bold px-1 shrink-0 flex items-center gap-1">
            <Compass className="w-3 h-3" />
            <span>Suite:</span>
          </span>
          {allItems.map((item) => {
            const isSelected = item.sku_id === activeSkuId;
            return (
              <button
                key={item.sku_id}
                onClick={() => {
                  setActiveSkuId(item.sku_id);
                  if (onSelectProduct) onSelectProduct(item);
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.5)] scale-105"
                    : "bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50"
                }`}
                title={`Inspect footprint for ${item.item_name}`}
              >
                {isSelected && <CheckCircle2 className="w-2.5 h-2.5" />}
                <span className="truncate max-w-[130px]">{item.item_name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Switch to 3D Model Quick Button */}
      {onSwitchTo3D && (
        <div className="absolute bottom-11 sm:bottom-14 inset-x-0 mx-auto w-fit z-30 pointer-events-auto">
          <button
            onClick={onSwitchTo3D}
            className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-cyan-400/60 backdrop-blur-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] text-[11px] font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>View 3D Model</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      )}
    </div>
  );
}
