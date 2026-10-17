"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, RotateCcw, Ruler, Camera, Check } from "lucide-react";

interface ARViewportProps {
  glbUrl: string;
  usdzUrl: string;
  environmentHdri: string;
  productName?: string;
  dimensions?: {
    width: number;
    depth: number;
    height: number;
  };
  activeFinishHex?: string;
  boundingBox?: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
}

function hexToRgba(hex: string): [number, number, number, number] {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return [0.8, 0.8, 0.8, 1.0];
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
    1.0,
  ];
}

export default function ARViewport({
  glbUrl,
  usdzUrl,
  environmentHdri,
  productName = "Product",
  dimensions,
  activeFinishHex,
  boundingBox,
}: ARViewportProps) {
  const modelRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(typeof window !== "undefined");
  const [showRulers, setShowRulers] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    setIsClient(true);
    import("@google/model-viewer").catch(console.error);
  }, []);

  // Apply material color dynamically when activeFinishHex or model changes
  const applyMaterialColor = useCallback(() => {
    if (!activeFinishHex || !modelRef.current) return;
    try {
      const el = modelRef.current;
      const model = el.model;
      if (model && model.materials && model.materials.length > 0) {
        const [r, g, b, a] = hexToRgba(activeFinishHex);
        // Apply to primary diffuse/pbr materials
        for (const mat of model.materials) {
          if (mat.pbrMetallicRoughness) {
            mat.pbrMetallicRoughness.setBaseColorFactor([r, g, b, a]);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to set dynamic model material color:", err);
    }
  }, [activeFinishHex]);

  const handleResetCamera = () => {
    if (modelRef.current) {
      try {
        modelRef.current.cameraOrbit = "0deg 75deg auto";
        modelRef.current.cameraTarget = "auto auto auto";
        modelRef.current.fieldOfView = "auto";
        if (typeof modelRef.current.jumpCameraToGoal === "function") {
          modelRef.current.jumpCameraToGoal();
        }
      } catch (e) {
        console.warn("Reset camera error:", e);
      }
    }
  };

  // High-Resolution Viewport Snapshot Export
  const handleExportSnapshot = async () => {
    if (!modelRef.current) return;
    setIsCapturing(true);
    try {
      let downloadUrl = "";
      if (typeof modelRef.current.toBlob === "function") {
        const blob = await modelRef.current.toBlob({ mimeType: "image/png" });
        if (blob) {
          downloadUrl = URL.createObjectURL(blob);
        }
      }
      if (!downloadUrl && typeof modelRef.current.toDataURL === "function") {
        downloadUrl = modelRef.current.toDataURL("image/png");
      }
      if (downloadUrl) {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${productName.toLowerCase().replace(/\s+/g, "_")}_cortex3d.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (downloadUrl.startsWith("blob:")) {
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);
        }
      }
    } catch (e) {
      console.warn("Snapshot export error:", e);
    } finally {
      setTimeout(() => setIsCapturing(false), 1500);
    }
  };

  useEffect(() => {
    const el = modelRef.current;
    if (!el) return;
    const onLoad = () => {
      try {
        el.cameraOrbit = "0deg 75deg auto";
        el.cameraTarget = "auto auto auto";
        el.fieldOfView = "auto";
        if (typeof el.jumpCameraToGoal === "function") {
          el.jumpCameraToGoal();
        }
        applyMaterialColor();
      } catch (e) {}
    };
    el.addEventListener("load", onLoad);
    if (el.model) {
      applyMaterialColor();
    }
    return () => {
      el.removeEventListener("load", onLoad);
    };
  }, [glbUrl, applyMaterialColor]);

  useEffect(() => {
    handleResetCamera();
  }, [glbUrl]);

  useEffect(() => {
    applyMaterialColor();
  }, [activeFinishHex, applyMaterialColor]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      {/* Subtle Studio Floor Grid Reflection */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_75%,rgba(34,211,238,0.08)_0%,transparent_60%)] pointer-events-none" />

      {/* Gemini 2D Detected Bounding Box Indicator */}
      {boundingBox && (
        <div
          className="absolute pointer-events-none z-10 border border-emerald-400/40 bg-emerald-500/5 rounded-2xl transition-all duration-500 hidden sm:block"
          style={{
            top: `${(boundingBox.ymin / 1000) * 100}%`,
            left: `${(boundingBox.xmin / 1000) * 100}%`,
            width: `${((boundingBox.xmax - boundingBox.xmin) / 1000) * 100}%`,
            height: `${((boundingBox.ymax - boundingBox.ymin) / 1000) * 100}%`,
          }}
        >
          <div className="absolute -top-5 left-2 px-2 py-0.5 bg-emerald-950/90 border border-emerald-500/40 rounded text-[9px] font-mono text-emerald-300">
            AI Space Match
          </div>
        </div>
      )}

      {/* 3D Model & Native AR Viewport */}
      {isClient && (
        <model-viewer
          key={glbUrl}
          ref={modelRef}
          src={glbUrl}
          ios-src={usdzUrl}
          ar
          ar-modes="quick-look scene-viewer webxr"
          ar-scale="auto"
          ar-placement="floor"
          camera-controls
          camera-orbit="0deg 75deg auto"
          camera-target="auto auto auto"
          field-of-view="auto"
          interaction-prompt="none"
          touch-action="pan-y"
          auto-rotate
          auto-rotate-delay="2000"
          rotation-per-second="18deg"
          shadow-intensity="1.6"
          shadow-softness="0.75"
          exposure="1.05"
          environment-image={environmentHdri}
          alt={`3D Model of ${productName}`}
          className="w-full h-full"
          style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
        >
          {/* Native AR Button (Top-Right) */}
          <button
            slot="ar-button"
            className="absolute top-14 sm:top-16 right-3 sm:right-4 z-30 flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-slate-900/85 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] text-xs font-semibold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            title="Launch Native Augmented Reality"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>View in Space (AR)</span>
          </button>

          {/* Interactive 3D Dimension Hotspot Annotations */}
          {dimensions && showRulers && (
            <>
              {/* Width Hotspot (Top edge) */}
              <button
                slot="hotspot-dim-width"
                data-position={`0 ${Math.max(0.45, dimensions.height)} 0`}
                data-normal="0 1 0"
                className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-cyan-400/80 text-cyan-300 text-[10px] font-mono shadow-xl backdrop-blur-md pointer-events-none flex items-center gap-1"
              >
                <span>W: {dimensions.width}m</span>
              </button>

              {/* Height Hotspot (Right edge) */}
              <button
                slot="hotspot-dim-height"
                data-position={`${Math.max(0.3, dimensions.width / 2)} ${dimensions.height / 2} 0`}
                data-normal="1 0 0"
                className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-emerald-400/80 text-emerald-300 text-[10px] font-mono shadow-xl backdrop-blur-md pointer-events-none flex items-center gap-1"
              >
                <span>H: {dimensions.height}m</span>
              </button>

              {/* Depth Hotspot (Floor depth) */}
              <button
                slot="hotspot-dim-depth"
                data-position={`0 0.05 ${Math.max(0.3, dimensions.depth / 2)}`}
                data-normal="0 0 1"
                className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-amber-400/80 text-amber-300 text-[10px] font-mono shadow-xl backdrop-blur-md pointer-events-none flex items-center gap-1"
              >
                <span>D: {dimensions.depth}m</span>
              </button>
            </>
          )}
        </model-viewer>
      )}

      {/* Floating Viewport Toolset (Bottom-right, desktop/tablet) */}
      <div className="absolute bottom-16 sm:bottom-20 right-3 sm:right-4 z-20 flex flex-col items-center gap-2">
        {/* Toggle 3D Dimension Rulers */}
        {dimensions && (
          <button
            onClick={() => setShowRulers((prev) => !prev)}
            className={`p-2 rounded-xl border backdrop-blur-md shadow-lg transition-all active:scale-90 cursor-pointer ${
              showRulers
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                : "bg-slate-900/70 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-700/60"
            }`}
            title={showRulers ? "Hide 3D Dimension Rulers" : "Show 3D Dimension Rulers"}
          >
            <Ruler className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Snapshot / Photo Export Button */}
        <button
          onClick={handleExportSnapshot}
          className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md shadow-lg transition-all active:scale-90 cursor-pointer"
          title="Download High-Res 3D Studio Snapshot"
        >
          {isCapturing ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Camera className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Reset Camera Angle */}
        <button
          onClick={handleResetCamera}
          className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 backdrop-blur-md shadow-lg transition-all active:scale-90 cursor-pointer"
          title="Reset 3D Angle"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

