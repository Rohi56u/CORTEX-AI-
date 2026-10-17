"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, RotateCcw } from "lucide-react";

interface ARViewportProps {
  glbUrl: string;
  usdzUrl: string;
  environmentHdri: string;
  productName?: string;
  boundingBox?: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
}

export default function ARViewport({
  glbUrl,
  usdzUrl,
  environmentHdri,
  productName = "Product",
  boundingBox,
}: ARViewportProps) {
  const modelRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(typeof window !== "undefined");

  useEffect(() => {
    setIsClient(true);
    import("@google/model-viewer").catch(console.error);
  }, []);

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
      } catch (e) {}
    };
    el.addEventListener("load", onLoad);
    return () => {
      el.removeEventListener("load", onLoad);
    };
  }, []);

  useEffect(() => {
    handleResetCamera();
  }, [glbUrl]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      {/* Subtle Studio Floor Grid Reflection */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_75%,rgba(34,211,238,0.08)_0%,transparent_60%)] pointer-events-none" />

      {/* Gemini 2D Detected Bounding Box Indicator (subtle visual confirmation of scan fit) */}
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
          {/* Native AR Button (Placed in top-right below header so it NEVER conflicts with bottom catalog) */}
          <button
            slot="ar-button"
            className="absolute top-14 sm:top-16 right-3 sm:right-4 z-30 flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-slate-900/85 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] text-xs font-semibold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            title="Launch Native Augmented Reality"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>View in Space (AR)</span>
          </button>
        </model-viewer>
      )}

      {/* Minimalist Floating Camera Reset Control (Bottom-right, desktop/tablet) */}
      <button
        onClick={handleResetCamera}
        className="hidden md:flex absolute bottom-20 right-4 z-20 p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 backdrop-blur-md shadow-lg transition-all active:scale-90"
        title="Reset 3D Angle"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
