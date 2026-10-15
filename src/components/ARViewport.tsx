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
  Camera,
  CheckCircle2,
  Crosshair,
  AlertTriangle,
  Scan,
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
  const [cameraError, setCameraError] = useState<string | null>(null);

  // AR Surface Calibration & Placement State
  // When in AR mode, start unplaced so user can calibrate and choose where to drop the furniture
  const [isPlaced, setIsPlaced] = useState<boolean>(isStudioMode);
  const [anchor, setAnchor] = useState<{ x: number; y: number }>({ x: 50, y: 65 });
  const [isAnchorLocked, setIsAnchorLocked] = useState(false);
  const [isDraggingAnchor, setIsDraggingAnchor] = useState(false);
  const [modelRotation, setModelRotation] = useState<number>(0);
  const [modelScale, setModelScale] = useState<number>(1.0);

  useEffect(() => {
    setIsClient(true);
    import("@google/model-viewer").catch(console.error);
  }, []);

  // When switching to studio mode, automatically mark placed
  useEffect(() => {
    if (isStudioMode) {
      setIsPlaced(true);
    }
  }, [isStudioMode]);

  // Update anchor position when Gemini AI returns a detected 2D bounding box
  useEffect(() => {
    if (boundingBox) {
      const centerX = Math.round((boundingBox.xmin + boundingBox.xmax) / 20);
      const centerY = Math.round((boundingBox.ymin + boundingBox.ymax) / 20);
      setAnchor({
        x: Math.max(15, Math.min(85, centerX)),
        y: Math.max(35, Math.min(85, centerY)),
      });
      setIsPlaced(true);
      setIsAnchorLocked(true);
    }
  }, [boundingBox]);

  // 1. Live Camera Passthrough Stream (Active in WebXR AR mode)
  const startCamera = useCallback(async () => {
    if (isStudioMode) return;
    setIsRequestingCamera(true);

    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        let stream: MediaStream | null = null;
        try {
          // Attempt 1: environment back camera (ideal for mobile phones)
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
            audio: false,
          });
        } catch (err1) {
          console.warn("Attempt 1 environment camera failed, trying fallback camera:", err1);
          // Attempt 2: default/front camera (MacBook FaceTime camera, laptops, desktop webcams)
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (stream) {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch((playErr) => console.warn("Video play error:", playErr));
          }
          setHasLiveCamera(true);
          setCameraError(null);
        }
      } else {
        setCameraError("Camera API not supported in this browser");
        setHasLiveCamera(false);
      }
    } catch (err: any) {
      console.warn("Camera access failed or blocked:", err);
      setHasLiveCamera(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission blocked in browser. Click the lock/camera icon in your address bar to allow.");
      } else {
        setCameraError(err.message || "Could not access camera.");
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

    // If not placed yet, this tap places the furniture!
    if (!isPlaced) {
      setIsPlaced(true);
    }
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

  const handleResetCamera = () => {
    setAnchor({ x: 50, y: 65 });
    setModelRotation(0);
    setModelScale(1.0);
    setIsPlaced(false);
    setIsAnchorLocked(false);
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
          <div className="absolute inset-0 bg-radial-vignette opacity-35" />
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

      {/* 3. AR FLOOR CALIBRATION PHASE (Before user places furniture) */}
      {!isStudioMode && !isPlaced && (
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center">
          {/* Surface Finding Reticle */}
          <div
            style={{
              left: `${anchor.x}%`,
              top: `${anchor.y}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-150"
          >
            <div className="w-32 h-32 border-2 border-dashed border-cyan-400/80 rounded-full animate-spin [animation-duration:10s] flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <div className="w-20 h-20 border border-cyan-300 rounded-full animate-ping opacity-30" />
              <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_12px_#22d3ee]" />
            </div>
          </div>

          {/* Calibrating Instructions & Tap to Place Banner */}
          <div className="absolute bottom-28 sm:bottom-32 inset-x-0 mx-auto w-fit px-4 pointer-events-auto flex flex-col items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4">
            <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-[11px] font-mono text-cyan-300 tracking-wider flex items-center gap-2 shadow-xl">
              <Scan className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>POINT CAMERA AT FLOOR</span>
            </div>

            <button
              onClick={() => setIsPlaced(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-[0_0_30px_rgba(6,182,212,0.6)] active:scale-95 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>✦ Tap Floor to Place {productName}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. GROUND RETICLE (When Placed in AR Mode) */}
      {!isStudioMode && isPlaced && (
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
              ? "pointer-events-none opacity-40"
              : "pointer-events-auto cursor-grab active:cursor-grabbing opacity-90"
          }`}
        >
          {/* Ground Contact Shadow Ellipse */}
          <div className="absolute w-44 h-16 rounded-[100%] bg-black/45 blur-md -z-10 translate-y-3 pointer-events-none" />

          {/* Minimalist Floor Ring */}
          <div className="relative flex items-center justify-center">
            <div
              className={`w-24 h-24 border border-dashed rounded-full flex items-center justify-center ${
                isAnchorLocked ? "border-emerald-400/50" : "border-cyan-400/70 shadow-[0_0_12px_rgba(34,211,238,0.3)]"
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isAnchorLocked ? "bg-emerald-400" : "bg-cyan-400"
                }`}
              />
            </div>
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

      {/* 5. 3D MODEL VIEWER (Only rendered when placed or in studio mode) */}
      {isClient && (isPlaced || isStudioMode) ? (
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
            interaction-prompt="none"
            camera-controls
            orientation={`0deg ${modelRotation}deg 0deg`}
            auto-rotate={isStudioMode ? "" : undefined}
            auto-rotate-delay={isStudioMode ? "1000" : undefined}
            rotation-per-second={isStudioMode ? "15deg" : undefined}
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
                className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✦ Launch WebXR / Native AR</span>
              </button>
            )}
          </model-viewer>
        </div>
      ) : (
        isClient && !isPlaced && (
          <div className="pointer-events-none" />
        )
      )}

      {/* 6. MINIMALIST BOTTOM-ANCHORED PLACEMENT TOOLBAR (When placed in AR Mode) */}
      {!isStudioMode && isPlaced && (
        <div
          data-interactive="true"
          className="absolute bottom-16 sm:bottom-20 inset-x-0 mx-auto w-fit z-30 flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-slate-700/60 shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-bottom-2"
        >
          {/* Rotate Left 45° */}
          <button
            onClick={() => handleRotate(-45)}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-90"
            title="Rotate -45°"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <span className="text-[10px] font-mono text-cyan-300 font-bold px-1 min-w-[32px] text-center">
            {modelRotation}°
          </span>

          {/* Rotate Right 45° */}
          <button
            onClick={() => handleRotate(45)}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-90"
            title="Rotate +45°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-700/60 mx-0.5" />

          {/* Lock / Move Toggle */}
          <button
            onClick={() => setIsAnchorLocked((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              isAnchorLocked
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
            }`}
          >
            {isAnchorLocked ? (
              <>
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Locked</span>
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3 text-cyan-400" />
                <span>Move</span>
              </>
            )}
          </button>

          {/* Recalibrate / Pick Up Button */}
          <button
            onClick={handleResetCamera}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-90"
            title="Pick Up & Recalibrate"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Camera Error / Permission Notice */}
      {cameraError && !hasLiveCamera && !isStudioMode && (
        <div
          data-interactive="true"
          className="absolute top-16 left-3 sm:left-4 z-40 max-w-xs px-3 py-2 rounded-xl bg-slate-900/95 border border-amber-500/50 backdrop-blur-xl text-amber-200 text-xs shadow-2xl flex items-start gap-2 animate-in fade-in"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-[10px] leading-tight text-amber-200">{cameraError}</p>
            <button
              onClick={startCamera}
              className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-[9px] font-mono text-amber-200 flex items-center gap-1 active:scale-95"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
