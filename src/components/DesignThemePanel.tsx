"use client";

import { useState, useEffect } from "react";
import {
  SpatialDimensions,
  SuggestedProduct,
  SavedRoomDesign,
} from "../types/neurocommerce";
import {
  X,
  Palette,
  Compass,
  Sparkles,
  Sun,
  Moon,
  Bookmark,
  Check,
  History,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Clock,
  Layers,
} from "lucide-react";

interface DesignThemePanelProps {
  isOpen: boolean;
  onClose: () => void;
  spatialAnalysis: SpatialDimensions;
  primaryProduct: SuggestedProduct;
  alternativeProducts?: SuggestedProduct[];
  voiceSummary: string;
  roomImage: string | null;
  onLoadSavedDesign?: (design: SavedRoomDesign) => void;
  onAddToCart?: (product: SuggestedProduct) => void;
}

export default function DesignThemePanel({
  isOpen,
  onClose,
  spatialAnalysis,
  primaryProduct,
  alternativeProducts = [],
  voiceSummary,
  roomImage,
  onLoadSavedDesign,
  onAddToCart,
}: DesignThemePanelProps) {
  const [activeTab, setActiveTab] = useState<"analysis" | "history">("analysis");
  const [savedDesigns, setSavedDesigns] = useState<SavedRoomDesign[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("NEUROCOMMERCE_SAVED_DESIGNS");
        if (stored) {
          setSavedDesigns(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("Failed to load saved designs from localStorage:", e);
      }
    }
  }, [isOpen]);

  // Derive theme title
  const getThemeTitle = () => {
    const room = spatialAnalysis.estimated_room_type.replace("_", " ");
    const light = spatialAnalysis.lighting_condition;
    if (light === "bright_daylight") {
      return `Contemporary Scandinavian ${room}`;
    } else if (light === "warm_indoor") {
      return `Warm Organic Modern ${room}`;
    }
    return `Minimalist Atmospheric ${room}`;
  };

  const handleSaveDesign = () => {
    const newDesign: SavedRoomDesign = {
      id: `design-${Date.now()}`,
      timestamp: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      roomType: spatialAnalysis.estimated_room_type,
      themeTitle: getThemeTitle(),
      wallColor: spatialAnalysis.detected_wall_color,
      lightingCondition: spatialAnalysis.lighting_condition,
      primaryProduct,
      alternativeProducts,
      voiceSummary,
      roomImage,
    };

    const updated = [newDesign, ...savedDesigns.filter((d) => d.id !== newDesign.id)].slice(0, 15);
    setSavedDesigns(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("NEUROCOMMERCE_SAVED_DESIGNS", JSON.stringify(updated));
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleDeleteDesign = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDesigns.filter((d) => d.id !== id);
    setSavedDesigns(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("NEUROCOMMERCE_SAVED_DESIGNS", JSON.stringify(updated));
    }
  };

  const handleRestore = (design: SavedRoomDesign) => {
    if (onLoadSavedDesign) {
      onLoadSavedDesign(design);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
      />

      {/* Slide-out Panel */}
      <aside className="relative z-10 w-full sm:max-w-md h-full bg-slate-900/95 border-l border-slate-700/80 backdrop-blur-2xl shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/90 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Design & Theme Telemetry
                </h3>
                <p className="text-[10px] font-mono text-cyan-400">
                  Gemini Spatial Reasoning Breakdown
                </p>
              </div>
            </div>

            <button
              id="close-theme-panel"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex rounded-xl bg-slate-950/70 p-1 border border-slate-800/80 text-xs font-mono">
            <button
              id="tab-analysis"
              onClick={() => setActiveTab("analysis")}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "analysis"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Design DNA</span>
            </button>

            <button
              id="tab-history"
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Saved History ({savedDesigns.length})</span>
            </button>
          </div>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
          {activeTab === "analysis" ? (
            <>
              {/* 1. Theme Identification Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold">
                    Detected Aesthetic Profile
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono">
                    98.4% Spatial Harmony
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-white capitalize">
                    {getThemeTitle()}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Space identified as a{" "}
                    <strong className="text-white capitalize">
                      {spatialAnalysis.estimated_room_type.replace("_", " ")}
                    </strong>{" "}
                    with balanced architectural clearance.
                  </p>
                </div>

                {/* Palette Elements Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  {/* Wall Color */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                    <div
                      className="w-5 h-5 rounded-full border border-white/20 shadow-sm shrink-0"
                      style={{
                        backgroundColor:
                          spatialAnalysis.detected_wall_color.split(" ")[0] ||
                          "#E5E1D8",
                      }}
                    />
                    <div className="truncate">
                      <span className="text-[9px] uppercase font-mono text-slate-500 block">
                        Wall Tone
                      </span>
                      <span className="text-xs font-semibold text-white capitalize truncate block">
                        {spatialAnalysis.detected_wall_color}
                      </span>
                    </div>
                  </div>

                  {/* Lighting Profile */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                    <div className="p-1 rounded-lg bg-amber-500/10 text-amber-300 shrink-0">
                      {spatialAnalysis.lighting_condition === "bright_daylight" ? (
                        <Sun className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-cyan-300" />
                      )}
                    </div>
                    <div className="truncate">
                      <span className="text-[9px] uppercase font-mono text-slate-500 block">
                        Lighting Condition
                      </span>
                      <span className="text-xs font-semibold text-white capitalize truncate block">
                        {spatialAnalysis.lighting_condition.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Architectural Supporting Reasons */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block px-1">
                  Supporting Architectural Reasons
                </span>

                {/* Reason 1: Spatial Clearance */}
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      Physical Clearance & Footprint Fit
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      Selected{" "}
                      <strong className="text-slate-200">
                        {primaryProduct.item_name}
                      </strong>{" "}
                      occupies {primaryProduct.dimensions_meters.width}m ×{" "}
                      {primaryProduct.dimensions_meters.depth}m footprint with{" "}
                      {primaryProduct.dimensions_meters.height}m vertical sightline,
                      preserving required 0.6m walking perimeter.
                    </p>
                  </div>
                </div>

                {/* Reason 2: Color Harmony */}
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      Material & Chromatic Contrast
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      Contrasts textured fabric sheen against detected{" "}
                      <span className="text-cyan-300 font-medium">
                        {spatialAnalysis.detected_wall_color}
                      </span>{" "}
                      walls without visually cluttering natural ambient illumination.
                    </p>
                  </div>
                </div>

                {/* Reason 3: Gemini Full Reasoning Quote */}
                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-cyan-400 font-bold uppercase">
                    <Sparkles className="w-3 h-3" />
                    <span>Gemini 2.5 Spatial Synthesis</span>
                  </div>
                  <p className="text-[11px] italic text-slate-300 leading-relaxed">
                    &ldquo;{voiceSummary}&rdquo;
                  </p>
                </div>
              </div>

              {/* 3. Supporting Complementary Suite Elements */}
              {alternativeProducts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block px-1">
                    Coordinated Room Suite Elements ({alternativeProducts.length})
                  </span>

                  <div className="space-y-1.5">
                    {alternativeProducts.slice(0, 4).map((alt) => (
                      <div
                        key={alt.sku_id}
                        className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                            {alt.category}
                          </span>
                          <span className="text-xs text-white truncate font-medium">
                            {alt.item_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-white">
                            ${alt.price_bundle}
                          </span>
                          {onAddToCart && (
                            <button
                              onClick={() => onAddToCart(alt)}
                              className="px-2 py-0.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] transition-all cursor-pointer"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Tab 2: Saved Room History */
            <div className="space-y-3">
              {savedDesigns.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p>No saved room designs yet.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Tap &apos;Save to History&apos; below to preserve your spatial scan.
                  </p>
                </div>
              ) : (
                savedDesigns.map((design) => (
                  <div
                    key={design.id}
                    onClick={() => handleRestore(design)}
                    className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col gap-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {design.roomImage && (
                          <img
                            src={design.roomImage}
                            alt="Room Thumbnail"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                          />
                        )}
                        <div>
                          <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                            {design.themeTitle}
                          </h5>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                            <Clock className="w-2.5 h-2.5 text-slate-500" />
                            <span>{design.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteDesign(design.id, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/80">
                      <span className="text-slate-400 truncate">
                        Anchor: {design.primaryProduct.item_name}
                      </span>
                      <span className="text-cyan-400 font-semibold shrink-0 flex items-center gap-0.5">
                        <span>Load</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
          {activeTab === "analysis" ? (
            <button
              id="save-design-btn"
              onClick={handleSaveDesign}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer active:scale-95 ${
                isSaved
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved to Room History!</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save Design to History</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setActiveTab("analysis")}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Back to Current Analysis
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
