"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Video,
  Mic,
  MicOff,
  Square,
  Sparkles,
  X,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Send,
  Trash2,
  Volume2,
  Maximize2,
  Layers,
} from "lucide-react";
import { NeuroCommerceAIResponse } from "../types/neurocommerce";

interface AttachedMedia {
  id: string;
  type: "photo" | "video" | "gallery";
  dataUrl: string;
  label: string;
}

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (result: NeuroCommerceAIResponse) => void;
}

export default function CameraCapture({
  isOpen,
  onClose,
  onAnalysisComplete,
}: CameraCaptureProps) {
  // Multimodal State
  const [userPrompt, setUserPrompt] = useState("");
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [speechInterim, setSpeechInterim] = useState("");
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia[]>([]);

  // Video Recording State
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordProgress, setRecordProgress] = useState(0);

  // Camera & Pipeline State
  const [hasLiveCamera, setHasLiveCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  // DOM & Media Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasSimRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  const MAX_RECORD_SECONDS = 15;

  // Initialize Speech-to-Text (Web Speech API)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let final = "";
          let interim = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          if (final.trim()) {
            setUserPrompt((prev) => (prev ? `${prev} ${final.trim()}` : final.trim()));
          }
          setSpeechInterim(interim);
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition notice:", e.error);
          setIsListeningMic(false);
          setSpeechInterim("");
        };

        recognition.onend = () => {
          setIsListeningMic(false);
          setSpeechInterim("");
        };

        speechRecognitionRef.current = recognition;
      }
    }
  }, []);

  // Request Live Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setHasLiveCamera(false);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Live camera requires HTTPS on mobile. Spatial Scanner Simulator is active."
      );
      return;
    }

    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 } },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setHasLiveCamera(true);
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
      } catch (err2: any) {
        const isSecure = typeof window !== "undefined" && window.isSecureContext;
        setCameraError(
          !isSecure
            ? "Camera blocked over plain HTTP on mobile. Live Spatial Simulator is active."
            : "Camera permission denied. Live Spatial Simulator is active."
        );
        setHasLiveCamera(false);
      }
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (speechRecognitionRef.current && isListeningMic) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecordingVideo(false);
    setIsListeningMic(false);
    setRecordProgress(0);
    setRecordSeconds(0);
  }, [isListeningMic]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Live Futuristic Background Simulator (when camera is offline/HTTP)
  useEffect(() => {
    if (!isOpen || hasLiveCamera) return;

    let scanY = 0;
    let angle = 0;

    const renderSimulator = () => {
      const canvas = canvasSimRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Realistic Spatial Studio Room Backdrop
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#080d1a");
      grad.addColorStop(0.55, "#131b2e");
      grad.addColorStop(1, "#070c18");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Perspective floor mesh
      const horizon = h * 0.55;
      ctx.strokeStyle = "rgba(6, 182, 212, 0.2)";
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

      // Room elements (window / wall architectural frame)
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.strokeRect(w * 0.12, horizon * 0.25, w * 0.24, horizon * 0.65);
      ctx.strokeRect(w * 0.65, horizon * 0.3, w * 0.22, horizon * 0.5);

      // Sweeping Laser
      scanY = (scanY + 2) % h;
      const laser = ctx.createLinearGradient(0, scanY - 18, 0, scanY + 18);
      laser.addColorStop(0, "transparent");
      laser.addColorStop(0.5, "rgba(34, 211, 238, 0.8)");
      laser.addColorStop(1, "transparent");
      ctx.fillStyle = laser;
      ctx.fillRect(0, scanY - 18, w, 36);

      // Rotating Surface Anchor Reticle
      angle += 0.015;
      ctx.save();
      ctx.translate(w / 2, horizon + 25);
      ctx.strokeStyle = "rgba(34, 211, 238, 0.65)";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 50, angle, angle + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#22d3ee";
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(renderSimulator);
    };

    renderSimulator();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, hasLiveCamera]);

  // Toggle Live Speech-to-Text
  const toggleSpeechRecognition = () => {
    if (!speechRecognitionRef.current) {
      alert("Speech recognition is not supported in this browser. You can type your request directly.");
      return;
    }

    if (isListeningMic) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      setIsListeningMic(false);
      setSpeechInterim("");
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListeningMic(true);
      } catch (err) {
        console.error("Speech start error:", err);
      }
    }
  };

  // Helper: Grab single high-res frame from active camera / simulator
  const captureCurrentFrame = (): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    if (hasLiveCamera && videoRef.current && videoRef.current.videoWidth > 0) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    } else if (canvasSimRef.current) {
      ctx.drawImage(canvasSimRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, 640, 360);
    }
    return canvas.toDataURL("image/jpeg", 0.85);
  };

  // 1. SNAP INSTANT PHOTO ACTION
  const handleSnapPhoto = () => {
    const frame = captureCurrentFrame();
    if (!frame) return;

    const newPhoto: AttachedMedia = {
      id: `photo-${Date.now()}`,
      type: "photo",
      dataUrl: frame,
      label: `Snapshot #${attachedMedia.filter((m) => m.type === "photo").length + 1}`,
    };
    setAttachedMedia((prev) => [...prev, newPhoto]);
  };

  // 2. 15s VIDEO RECORDING ACTION
  const handleToggleRecordVideo = () => {
    if (isRecordingVideo) {
      stopVideoRecording();
    } else {
      startVideoRecording();
    }
  };

  const startVideoRecording = () => {
    setIsRecordingVideo(true);
    setRecordSeconds(0);
    setRecordProgress(0);

    if (mediaStreamRef.current) {
      recordedChunksRef.current = [];
      try {
        const mimeType = MediaRecorder.isTypeSupported("video/mp4")
          ? "video/mp4"
          : "video/webm";
        const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType });
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current = recorder;
        recorder.start(500);
      } catch (e) {
        console.warn("MediaRecorder fallback notice:", e);
      }
    }

    const startTime = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const secs = Math.min(MAX_RECORD_SECONDS, Math.floor(elapsed));
      setRecordSeconds(secs);
      setRecordProgress(Math.min(100, (elapsed / MAX_RECORD_SECONDS) * 100));

      if (elapsed >= MAX_RECORD_SECONDS) {
        stopVideoRecording();
      }
    }, 100);
  };

  const stopVideoRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setIsRecordingVideo(false);

    // Save keyframe as video clip attachment
    const frame = captureCurrentFrame();
    if (frame) {
      const newVideo: AttachedMedia = {
        id: `video-${Date.now()}`,
        type: "video",
        dataUrl: frame,
        label: `Video (${recordSeconds}s Scan)`,
      };
      setAttachedMedia((prev) => [...prev, newVideo]);
    }
  };

  // 3. GALLERY / ALBUM UPLOAD ACTION
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxDim = 800;
            let w = img.width;
            let h = img.height;
            if (w > h && w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              resolve(canvas.toDataURL("image/jpeg", 0.8));
            } else {
              resolve(ev.target?.result as string);
            }
          };
          img.onerror = () => resolve(ev.target?.result as string);
          img.src = ev.target?.result as string;
        };
        reader.readAsDataURL(file);
      });

      if (dataUrl) {
        setAttachedMedia((prev) => [
          ...prev,
          {
            id: `gallery-${Date.now()}-${i}`,
            type: "gallery",
            dataUrl,
            label: file.name.slice(0, 15),
          },
        ]);
      }
    }
  };

  const removeMedia = (id: string) => {
    setAttachedMedia((prev) => prev.filter((m) => m.id !== id));
  };

  // 4. SUBMIT MULTIMODAL PAYLOAD (Photos + Video + Voice/Text)
  const handleSubmitMultimodal = async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setCameraError(null);

    try {
      // Gather images: from attached media, or fallback to current live frame
      let imagesToSend: string[] = attachedMedia.map((m) => m.dataUrl);

      if (imagesToSend.length === 0) {
        const liveSnapshot = captureCurrentFrame();
        imagesToSend = [liveSnapshot, liveSnapshot, liveSnapshot];
      }

      while (imagesToSend.length < 3) {
        imagesToSend.push(imagesToSend[0]);
      }

      const storedKey =
        typeof window !== "undefined"
          ? localStorage.getItem("GEMINI_API_KEY") || ""
          : "";

      const response = await fetch("/api/analyze-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: imagesToSend,
          prompt:
            userPrompt.trim() ||
            "Analyze my room spatial clearance and match optimal furniture.",
          apiKey: storedKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Spatial analysis failed with status: ${response.status}`);
      }

      const result: NeuroCommerceAIResponse = await response.json();
      onAnalysisComplete(result);
      onClose();
    } catch (err: any) {
      console.error(err);
      setCameraError(err.message || "Failed to analyze spatial room.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black flex flex-col justify-between animate-in fade-in duration-300 select-none">
      {/* FULL-VIEW CAMERA BACKGROUND (100% Fullscreen Viewport) */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover ${hasLiveCamera ? "block" : "hidden"}`}
        />
        <canvas
          ref={canvasSimRef}
          width={640}
          height={360}
          className={`w-full h-full object-cover ${hasLiveCamera ? "hidden" : "block"}`}
        />

        {/* Spatial Scanner Grid & Reticle Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Laser Sweep line during video recording or analysis */}
        {(isRecordingVideo || isAnalyzing) && (
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-pulse top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
      </div>

      {/* TOP FLOATING HUD BAR */}
      <header className="relative z-30 p-4 flex items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-slate-700/60 shadow-xl flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-widest text-white font-mono">
                LIVE SPATIAL MODE
              </span>
              <span className="text-[9px] text-cyan-400 font-mono">
                MULTIMODAL CHAT
              </span>
            </div>
          </div>

          {/* Status Indicator */}
          {hasLiveCamera ? (
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              PASSTHROUGH ACTIVE
            </span>
          ) : (
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              SIMULATOR ACTIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Switch Camera */}
          {hasLiveCamera && (
            <button
              onClick={() => {
                setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
              }}
              className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 backdrop-blur-xl transition-all cursor-pointer"
              title="Switch Front/Rear Camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Skip / Close Button */}
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-2xl bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Browse 3D</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CENTER RECORDING TIMER RING (Visible during video recording) */}
      {isRecordingVideo && (
        <div className="relative z-20 mx-auto flex flex-col items-center pointer-events-none animate-in zoom-in duration-200">
          <div className="w-20 h-20 rounded-full border-4 border-rose-500/40 border-t-rose-500 animate-spin flex items-center justify-center">
            <span className="font-mono text-sm font-bold text-white">
              {recordSeconds}s
            </span>
          </div>
          <span className="mt-2 text-[11px] font-mono uppercase tracking-wider text-rose-300 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50">
            Recording Room Motion ({15 - recordSeconds}s left)
          </span>
        </div>
      )}

      {/* GEMINI ANALYZING OVERLAY */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="w-14 h-14 border-3 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
          <p className="mt-4 text-base font-mono text-cyan-300 font-bold tracking-wider">
            GEMINI 1.5 PRO ANALYZING MULTIMODAL ROOM...
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Fusing video keyframes, photos, and voice styling prompt
          </p>
        </div>
      )}

      {/* BOTTOM FLOATING MULTIMODAL CHAT DOCK */}
      <footer className="relative z-30 w-full max-w-3xl mx-auto p-3 sm:p-4 flex flex-col gap-2.5 pointer-events-auto">
        {/* Error / HTTP Camera Banner */}
        {cameraError && !isAnalyzing && (
          <div className="p-2.5 rounded-2xl bg-amber-950/90 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px]">{cameraError}</span>
            </div>
            <button
              onClick={startCamera}
              className="ml-2 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* ATTACHMENTS TRAY (Photos, Video, Album clips) */}
        {attachedMedia.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto p-2 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/60">
            {attachedMedia.map((media) => (
              <div
                key={media.id}
                className="relative group shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-cyan-500/40 bg-black shadow-md flex items-center justify-center"
              >
                <img
                  src={media.dataUrl}
                  alt={media.label}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeMedia(media.id)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-950/80 text-rose-400 hover:text-white"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
                <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] font-mono text-cyan-300 text-center truncate px-0.5">
                  {media.type === "photo" && "📸"}
                  {media.type === "video" && "🎥"}
                  {media.type === "gallery" && "🖼️"}{" "}
                  {media.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Real-time Voice Transcription Live Feedback */}
        {isListeningMic && (
          <div className="px-4 py-2 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-rose-500/40 flex items-center gap-3 animate-pulse">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-3 bg-rose-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-5 bg-rose-400 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-1.5 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
            <div className="flex-1 text-xs font-mono text-rose-200">
              <span className="font-bold">Listening: </span>
              <span>{speechInterim || "Speak your room preference or furniture style..."}</span>
            </div>
          </div>
        )}

        {/* INPUT BAR: Multimodal Control Strip */}
        <div className="p-2 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-slate-700/70 shadow-2xl flex flex-col gap-2">
          {/* Text Input Row */}
          <div className="flex items-center gap-2 px-2">
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmitMultimodal();
              }}
              placeholder="Spoken or typed intent: 'Velvet teal sofa that fits this 2.5m wall'..."
              className="flex-1 bg-transparent border-none text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none"
            />

            {/* Mic Toggle Button */}
            <button
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-xl transition-all ${
                isListeningMic
                  ? "bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse"
                  : "bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700"
              }`}
              title="Voice Input (Speech-to-Text)"
            >
              {isListeningMic ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick Action Strip (Snap Photo, Record Video, Album Upload, Submit) */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 px-1">
            <div className="flex items-center gap-1.5">
              {/* 1. Snap Photo */}
              <button
                onClick={handleSnapPhoto}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 font-medium transition-all active:scale-95 cursor-pointer"
                title="Snap a photo of this view"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Snap Photo</span>
              </button>

              {/* 2. Record 15s Video */}
              <button
                onClick={handleToggleRecordVideo}
                className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-medium transition-all active:scale-95 cursor-pointer ${
                  isRecordingVideo
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
                title="Record room panning video clip"
              >
                {isRecordingVideo ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>Stop ({recordSeconds}s)</span>
                  </>
                ) : (
                  <>
                    <Video className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">15s Video</span>
                  </>
                )}
              </button>

              {/* 3. Album / Gallery Upload */}
              <label
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 font-medium transition-all active:scale-95 cursor-pointer"
                title="Upload from device photos/gallery"
              >
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Gallery</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* 4. SUBMIT CONFIRM BUTTON */}
            <button
              onClick={handleSubmitMultimodal}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>✦ Analyze Space</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
