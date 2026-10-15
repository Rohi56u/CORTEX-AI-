"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  RotateCcw,
  Sparkles,
  RefreshCw,
  Lock,
  Unlock,
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Camera,
  CheckCircle2,
  Crosshair,
} from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasSimRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isClient, setIsClient] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [hasLiveCamera, setHasLiveCamera] = useState(false);
  const [isRequestingCamera, setIsRequestingCamera] = useState(false);

  // Interactive Floor Anchor State (percentages of container: 50% X, 65% Y is ideal floor level)
  const [anchor, setAnchor] = useState<{ x: number; y: number }>({ x: 50, y: 65 });
  const [isAnchorLocked, setIsAnchorLocked] = useState(false);
  const [isDraggingAnchor, setIsDraggingAnchor] = useState(false);
  const [modelRotation, setModelRotation] = useState<number>(0);
  const [modelScale, setModelScale] = useState<number>(1.0);

  useEffect(() => {
    setIsClient(true);
    import("@google/model-viewer").catch(console.error);
  }, []);

  // Update anchor position when Gemini AI returns a detected 2D bounding box
  useEffect(() => {
    if (boundingBox) {
      const centerX = Math.round((boundingBox.xmin + boundingBox.xmax) / 20);
      const centerY = Math.round((boundingBox.ymin + boundingBox.ymax) / 20);
      setAnchor({
        x: Math.max(15, Math.min(85, centerX)),
        y: Math.max(35, Math.min(85, centerY)),
      });
      setIsAnchorLocked(true);
    }
  }, [boundingBox]);

  // 1. Live Camera Passthrough Stream (Active in WebXR AR mode)
  const startCamera = useCallback(async () => {
    if (isStudioMode) return;
    setIsRequestingCamera(true);

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
          audio: false,
        });

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
        mediaStreamRef.current = stream2;
        if (videoRef.current) {
          videoRef.current.srcObject = stream2;
          await videoRef.current.play().catch(() => {});
        }
        setHasLiveCamera(true);
      } catch (err2) {
        setHasLiveCamera(false);
      }
    } finally {
      setIsRequestingCamera(false);
    }
  }, [isStudioMode]);

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

    startCamera();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isStudioMode, startCamera]);

  // 2. Fallback Animated Spatial LiDAR Simulator (if camera is blocked or plain HTTP)
  useEffect(() => {
    if (isStudioMode || hasLiveCamera) return;

    let scanY = 0;
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

      // Room outline objects
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

  // Handle Tap-to-Place anywhere on the floor
  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isStudioMode || isAnchorLocked) return;

    // Ignore clicks on buttons or floating control menus
    if ((e.target as HTMLElement).closest("button, input, [data-interactive='true']")) {
      return;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp inside comfortable floor placement boundaries
    setAnchor({
      x: Math.round(Math.max(15, Math.min(85, clickX))),
      y: Math.round(Math.max(35, Math.min(85, clickY))),
    });
  };

  // Drag reticle handle to slide furniture across room floor
  const handleReticlePointerDown = (e: React.PointerEvent) => {
    if (isStudioMode || isAnchorLocked) return;
    e.stopPropagation();
    setIsDraggingAnchor(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleReticlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingAnchor || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const posX = ((e.clientX - rect.left) / rect.width) * 100;
    const posY = ((e.clientY - rect.top) / rect.height) * 100;

    setAnchor({
      x: Math.round(Math.max(15, Math.min(85, posX))),
      y: Math.round(Math.max(35, Math.min(85, posY))),
    });
  };

  const handleReticlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingAnchor) {
      setIsDraggingAnchor(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const handleRotate = (delta: number) => {
    setModelRotation((prev) => (prev + delta + 360) % 360);
  };

  const handleScaleChange = (delta: number) => {
    setModelScale((prev) => {
      const next = Math.round((prev + delta) * 10) / 10;
      return Math.max(0.6, Math.min(1.5, next));
    });
  };

  const handleResetCamera = () => {
    setAnchor({ x: 50, y: 65 });
    setModelRotation(0);
    setModelScale(1.0);
    if (modelRef.current) {
      modelRef.current.cameraOrbit = "0deg 75deg 105%";
      modelRef.current.cameraTarget = "auto auto auto";
    }
  };

  // Offset calculation for CSS translate:
  // Base anchor center is (50%, 65%). Translation is relative to that base point.
  const offsetXPercent = isStudioMode ? 0 : anchor.x - 50;
  const offsetYPercent = isStudioMode ? 0 : anchor.y - 65;

  return (
    <div
      ref={containerRef}
      onClick={handleViewportClick}
      className={`relative w-full h-full overflow-hidden bg-slate-950 select-none ${
        !isStudioMode && !isAnchorLocked ? "cursor-crosshair" : "cursor-default"
      }`}
    >
      {/* 1. CAMERA PASSTHROUGH BACKGROUND (in AR Mode) */}
      {!isStudioMode && (
        <div className="absolute inset-0 z-0 pointer-events-none">
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
          <div className="absolute inset-0 bg-radial-vignette opacity-40" />
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

      {/* 3. INTERACTIVE GROUND RETICLE & SURFACE ANCHOR (in AR Mode) */}
      {!isStudioMode && (
        <div
          onPointerDown={handleReticlePointerDown}
          onPointerMove={handleReticlePointerMove}
          onPointerUp={handleReticlePointerUp}
          style={{
            left: `${anchor.x}%`,
            top: `${anchor.y}%`,
          }}
          className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-150 flex flex-col items-center justify-center ${
            isAnchorLocked
              ? "pointer-events-none"
              : "pointer-events-auto cursor-grab active:cursor-grabbing"
          }`}
        >
          {/* Ground Contact Shadow Ellipse */}
          <div className="absolute w-44 h-16 rounded-[100%] bg-black/40 blur-md -z-10 translate-y-3 pointer-events-none" />

          {/* Dynamic Spatial Ground Reticle */}
          <div className="relative flex items-center justify-center">
            {/* Outer Rotating Disc */}
            <div
              className={`w-28 h-28 border-2 border-dashed rounded-full animate-spin [animation-duration:12s] flex items-center justify-center ${
                isAnchorLocked ? "border-emerald-400/60" : "border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              }`}
            />

            {/* Inner Pulsing Disc */}
            <div
              className={`absolute w-20 h-20 border rounded-full flex items-center justify-center ${
                isAnchorLocked
                  ? "border-emerald-400/80 bg-emerald-500/10"
                  : "border-cyan-300 animate-pulse bg-cyan-500/10"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  isAnchorLocked
                    ? "bg-emerald-400 shadow-[0_0_12px_#34d399]"
                    : "bg-cyan-400 shadow-[0_0_15px_#22d3ee]"
                }`}
              />
            </div>

            {/* Crosshairs */}
            <div
              className={`absolute -top-3.5 w-0.5 h-3.5 ${
                isAnchorLocked ? "bg-emerald-400" : "bg-cyan-400"
              }`}
            />
            <div
              className={`absolute -bottom-3.5 w-0.5 h-3.5 ${
                isAnchorLocked ? "bg-emerald-400" : "bg-cyan-400"
              }`}
            />
            <div
              className={`absolute -left-3.5 h-0.5 w-3.5 ${
                isAnchorLocked ? "bg-emerald-400" : "bg-cyan-400"
              }`}
            />
            <div
              className={`absolute -right-3.5 h-0.5 w-3.5 ${
                isAnchorLocked ? "bg-emerald-400" : "bg-cyan-400"
              }`}
            />
          </div>

          {/* Anchor Status Badge */}
          <div
            className={`mt-3 px-3 py-1 rounded-full backdrop-blur-md border text-[10px] font-mono tracking-wider flex items-center gap-1.5 shadow-xl select-none transition-all ${
              isAnchorLocked
                ? "bg-emerald-950/90 border-emerald-500/60 text-emerald-300"
                : "bg-slate-900/90 border-cyan-500/50 text-cyan-300"
            }`}
          >
            {isAnchorLocked ? (
              <>
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>ANCHORED ON FLOOR [{anchor.x}%, {anchor.y}%]</span>
              </>
            ) : (
              <>
                <Crosshair className="w-3 h-3 text-cyan-400 animate-spin" />
                <span>TAP / DRAG TO ANCHOR [{anchor.x}%, {anchor.y}%]</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Gemini 2D Detected Bounding Box Overlay */}
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
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none transition-opacity">
          <div className="w-10 h-10 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
          <p className="mt-3 text-xs font-mono text-cyan-300 tracking-wider">
            SYNCHRONIZING 3D OBJECT...
          </p>
        </div>
      )}

      {/* 4. 3D MODEL VIEWER (Hardware-Accelerated Anchored Wrapper) */}
      {isClient ? (
        <div
          className="absolute inset-0 z-20 transition-transform duration-200 ease-out pointer-events-auto"
          style={{
            transform: `translate(${offsetXPercent}%, ${offsetYPercent}%) scale(${modelScale})`,
            transformOrigin: "50% 65%",
          }}
        >
          <model-viewer
            ref={modelRef}
            src={glbUrl}
            ios-src={usdzUrl}
            ar={!isStudioMode}
            ar-modes="webxr scene-viewer quick-look"
            ar-placement="floor"
            ar-scale="auto"
            interaction-prompt="auto"
            camera-controls
            orientation={`0deg ${modelRotation}deg 0deg`}
            auto-rotate={isStudioMode}
            auto-rotate-delay="1000"
            rotation-per-second="15deg"
            touch-action="pan-y"
            environment-image={environmentHdri}
            shadow-intensity="1.6"
            shadow-softness="0.75"
            exposure="1.05"
            alt={`3D Model of ${productName}`}
            className="w-full h-full"
            style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
          >
            {/* Native WebXR AR Button (Launches Hardware QuickLook / ARCore on Mobile) */}
            {!isStudioMode && (
              <button
                slot="ar-button"
                className="absolute bottom-44 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs sm:text-sm px-5 py-3 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>✦ Launch WebXR / Native AR</span>
              </button>
            )}
          </model-viewer>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs">
          INITIALIZING SPATIAL VIEWPORT...
        </div>
      )}

      {/* 5. FLOATING SPATIAL ANCHOR CONTROL TOOLBAR (in AR Mode) */}
      {!isStudioMode && (
        <div
          data-interactive="true"
          className="absolute top-20 right-3 sm:right-4 z-30 flex flex-col gap-2 items-end pointer-events-auto"
        >
          {/* Lock / Unlock Anchor Button */}
          <button
            onClick={() => setIsAnchorLocked((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl backdrop-blur-xl border text-xs font-semibold shadow-xl transition-all cursor-pointer active:scale-95 ${
              isAnchorLocked
                ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "bg-slate-900/85 border-cyan-500/60 text-cyan-300 hover:bg-slate-800 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            }`}
            title={isAnchorLocked ? "Unlock Anchor to Reposition" : "Lock Anchor to Floor"}
          >
            {isAnchorLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Locked to Floor</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tap Floor to Anchor</span>
              </>
            )}
          </button>

          {/* Quick Rotation Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/85 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-xl">
            <button
              onClick={() => handleRotate(-45)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-90"
              title="Rotate Counter-Clockwise 45°"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-cyan-300 px-1 font-bold min-w-[34px] text-center">
              {modelRotation}°
            </span>
            <button
              onClick={() => handleRotate(45)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-90"
              title="Rotate Clockwise 45°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Scale Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/85 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-xl">
            <button
              onClick={() => handleScaleChange(-0.1)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-90"
              title="Scale Down"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-cyan-300 px-1 font-bold min-w-[34px] text-center">
              {Math.round(modelScale * 100)}%
            </span>
            <button
              onClick={() => handleScaleChange(0.1)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-90"
              title="Scale Up"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset View & Anchor Button */}
          <button
            onClick={handleResetCamera}
            className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-xl shadow-xl transition-all active:scale-90"
            title="Reset Floor Anchor & Viewpoint"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Camera Re-Enable Button (if camera is inactive or blocked) */}
      {!isStudioMode && !hasLiveCamera && (
        <div
          data-interactive="true"
          className="absolute top-20 left-3 sm:left-4 z-30 pointer-events-auto"
        >
          <button
            onClick={startCamera}
            disabled={isRequestingCamera}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-mono shadow-xl backdrop-blur-xl transition-all active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isRequestingCamera ? "Connecting Camera..." : "Enable Live Camera"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
