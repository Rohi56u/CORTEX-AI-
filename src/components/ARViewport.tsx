"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, Sparkles, RefreshCw, Layers } from "lucide-react";

interface ARViewportProps {
  glbUrl: string;
  usdzUrl: string;
  environmentHdri: string;
  isStudioMode: boolean;
  boundingBox?: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
  productName?: string;
}

export default function ARViewport({
  glbUrl,
  usdzUrl,
  environmentHdri,
  isStudioMode,
  boundingBox,
  productName = "Product",
}: ARViewportProps) {
  const modelRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasSimRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isClient, setIsClient] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [hasLiveCamera, setHasLiveCamera] = useState(false);

  useEffect(() => {
    setIsClient(true);
    import("@google/model-viewer").catch(console.error);
  }, []);

  // 1. Live Camera Passthrough Stream (Active in WebXR AR mode)
  useEffect(() => {
    if (isStudioMode) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      setHasLiveCamera(false);
      return;
    }

    let isMounted = true;
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
            audio: false,
          });

          if (!isMounted) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
          }
          setHasLiveCamera(true);
        }
      } catch (err1) {
        try {
          const stream2 = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          if (!isMounted) {
            stream2.getTracks().forEach((t) => t.stop());
            return;
          }
          mediaStreamRef.current = stream2;
          if (videoRef.current) {
            videoRef.current.srcObject = stream2;
            await videoRef.current.play().catch(() => {});
          }
          setHasLiveCamera(true);
        } catch (err2) {
          setHasLiveCamera(false);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isStudioMode]);

  // 2. Fallback Animated Spatial LiDAR Simulator (if camera is blocked/plain HTTP)
  useEffect(() => {
    if (isStudioMode || hasLiveCamera) return;

    let scanY = 0;
    let angle = 0;

    const renderSimulator = () => {
      const canvas = canvasSimRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Realistic Room Simulator Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#080e1c");
      grad.addColorStop(0.55, "#142035");
      grad.addColorStop(1, "#070c18");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Perspective floor mesh
      const horizon = h * 0.58;
      ctx.strokeStyle = "rgba(6, 182, 212, 0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      ctx.lineTo(w, horizon);
      ctx.stroke();

      for (let x = -w * 0.5; x <= w * 1.5; x += 55) {
        ctx.beginPath();
        ctx.moveTo(w / 2, horizon);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = horizon + 12; y < h; y += (y - horizon) * 0.4 + 10) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Room wall objects (outline)
      ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
      ctx.strokeRect(w * 0.12, horizon * 0.25, w * 0.24, horizon * 0.65);
      ctx.strokeRect(w * 0.65, horizon * 0.3, w * 0.22, horizon * 0.5);

      // Sweeping Laser
      scanY = (scanY + 2) % h;
      const laser = ctx.createLinearGradient(0, scanY - 18, 0, scanY + 18);
      laser.addColorStop(0, "transparent");
      laser.addColorStop(0.5, "rgba(34, 211, 238, 0.7)");
      laser.addColorStop(1, "transparent");
      ctx.fillStyle = laser;
      ctx.fillRect(0, scanY - 18, w, 36);

      animFrameRef.current = requestAnimationFrame(renderSimulator);
    };

    renderSimulator();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isStudioMode, hasLiveCamera]);

  // Model Viewer Load Event Listener
  useEffect(() => {
    if (!isClient) return;

    setModelLoaded(false);
    const viewer = modelRef.current;
    if (!viewer) return;

    const handleLoad = () => setModelLoaded(true);
    const handleError = () => setModelLoaded(true);

    if (viewer.loaded) setModelLoaded(true);

    viewer.addEventListener("load", handleLoad);
    viewer.addEventListener("error", handleError);

    const safetyTimer = setTimeout(() => setModelLoaded(true), 1500);

    return () => {
      clearTimeout(safetyTimer);
      viewer.removeEventListener("load", handleLoad);
      viewer.removeEventListener("error", handleError);
    };
  }, [glbUrl, isClient]);

  const handleResetCamera = () => {
    if (modelRef.current) {
      modelRef.current.cameraOrbit = "0deg 75deg 105%";
      modelRef.current.cameraTarget = "auto auto auto";
      modelRef.current.fieldOfView = "auto";
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      {/* 1. CAMERA PASSTHROUGH BACKGROUND (in AR Mode) */}
      {!isStudioMode && (
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className={`w-full h-full object-cover ${hasLiveCamera ? "block" : "hidden"}`}
          />
          <canvas
            ref={canvasSimRef}
            width={640}
            height={360}
            className={`w-full h-full object-cover ${hasLiveCamera ? "hidden" : "block"}`}
          />
          {/* Subtle AR Passthrough Vignette */}
          <div className="absolute inset-0 pointer-events-none bg-radial-vignette opacity-40" />
        </div>
      )}

      {/* 2. 3D STUDIO CANVAS BACKGROUND (in Studio Mode) */}
      {isStudioMode && (
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(6, 182, 212, 0.2) 0%, transparent 70%),
              linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            backgroundSize: "100% 100%, 40px 40px, 40px 40px",
          }}
        />
      )}

      {/* 3. TARGET RETICLE & SURFACE ANCHOR (in AR Passthrough Mode) */}
      {!isStudioMode && (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center mt-28">
            {/* Animated ground plane anchor circle */}
            <div className="w-28 h-28 border-2 border-dashed border-cyan-400/70 rounded-full animate-spin [animation-duration:10s] flex items-center justify-center" />
            <div className="absolute w-20 h-20 border border-cyan-300/80 rounded-full animate-pulse flex items-center justify-center">
              <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee]" />
            </div>

            {/* Crosshairs */}
            <div className="absolute -top-3.5 w-0.5 h-3.5 bg-cyan-400" />
            <div className="absolute -bottom-3.5 w-0.5 h-3.5 bg-cyan-400" />
            <div className="absolute -left-3.5 h-0.5 w-3.5 bg-cyan-400" />
            <div className="absolute -right-3.5 h-0.5 w-3.5 bg-cyan-400" />
          </div>

          <div className="mt-4 px-3.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 text-[11px] font-mono text-cyan-300 tracking-wider flex items-center gap-2 shadow-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            SPATIAL OBJECT ANCHORED IN ROOM
          </div>
        </div>
      )}

      {/* Gemini 2D Bounding Box Visualizer Overlay */}
      {boundingBox && !isStudioMode && (
        <div
          className="absolute pointer-events-none z-10 border border-emerald-400/60 bg-emerald-500/10 rounded-md transition-all duration-500"
          style={{
            top: `${(boundingBox.ymin / 1000) * 100}%`,
            left: `${(boundingBox.xmin / 1000) * 100}%`,
            width: `${((boundingBox.xmax - boundingBox.xmin) / 1000) * 100}%`,
            height: `${((boundingBox.ymax - boundingBox.ymin) / 1000) * 100}%`,
          }}
        >
          <div className="absolute -top-6 left-0 px-2 py-0.5 bg-emerald-950/90 border border-emerald-500/40 rounded text-[10px] font-mono text-emerald-300">
            Detected Placement Zone [{Math.round((boundingBox.xmax - boundingBox.xmin) / 10)}% W]
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {!modelLoaded && isClient && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none transition-opacity">
          <div className="w-10 h-10 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
          <p className="mt-3 text-xs font-mono text-cyan-300 tracking-wider">
            SYNCHRONIZING 3D OBJECT...
          </p>
        </div>
      )}

      {/* 4. 3D MODEL VIEWER (Transparent Background Layered Over Real Camera Feed!) */}
      {isClient ? (
        <model-viewer
          ref={modelRef}
          src={glbUrl}
          ios-src={usdzUrl}
          ar={!isStudioMode}
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate={isStudioMode}
          auto-rotate-delay="1000"
          rotation-per-second="15deg"
          touch-action="pan-y"
          environment-image={environmentHdri}
          shadow-intensity="1.6"
          shadow-softness="0.75"
          exposure="1.05"
          alt={`3D Model of ${productName}`}
          className="absolute inset-0 z-15"
          style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
        >
          {/* Native WebXR AR Button (Launches ARCore / QuickLook) */}
          {!isStudioMode && (
            <button
              slot="ar-button"
              className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-sm px-6 py-3.5 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>✦ Lock to Floor in AR</span>
            </button>
          )}

          {/* Quick Controls in Top Right */}
          <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">
            <button
              onClick={handleResetCamera}
              title="Reset Viewpoint"
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md shadow-md transition-all active:scale-90"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </model-viewer>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs">
          INITIALIZING SPATIAL VIEWPORT...
        </div>
      )}
    </div>
  );
}
