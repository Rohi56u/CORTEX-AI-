"use client";

import { useState, useEffect } from "react";
import { SuggestedProduct } from "../types/neurocommerce";
import {
  Sparkles,
  ShoppingBag,
  RotateCcw,
  Eye,
  Check,
  AlertCircle,
  Maximize2,
  Sliders,
} from "lucide-react";

interface AIStagingPreviewProps {
  roomImage: string | null;
  product: SuggestedProduct;
  roomType?: string;
  wallColor?: string;
  lightingCondition?: string;
  onAddToCart?: (product: SuggestedProduct) => void;
  onLaunchAR?: () => void;
}

export default function AIStagingPreview({
  roomImage,
  product,
  roomType = "living room",
  wallColor = "warm sand",
  lightingCondition = "bright daylight",
  onAddToCart,
  onLaunchAR,
}: AIStagingPreviewProps) {
  const [stagedImage, setStagedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    setStagedImage(null);
    setErrorMessage(null);
    setShowOriginal(false);
  }, [product.sku_id]);

  const handleGenerateStaging = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const storedKey =
        typeof window !== "undefined"
          ? localStorage.getItem("GEMINI_API_KEY") || ""
          : "";

      const res = await fetch("/api/generate-room-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomImage: roomImage || null,
          productName: product.item_name,
          category: product.category,
          roomType,
          wallColor,
          lightingCondition,
          apiKey: storedKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.stagedImageUrl) {
        throw new Error(data.error || "Failed to generate staging preview.");
      }

      setStagedImage(data.stagedImageUrl);
      setShowOriginal(false);
    } catch (err: any) {
      console.error("AI Staging generation error:", err);
      setErrorMessage(err.message || "Failed to generate virtual staging.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center select-none">
      {/* Main Image Display: Staged vs. Original */}
      {stagedImage ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={showOriginal && roomImage ? roomImage : stagedImage}
            alt={showOriginal ? "Original Room" : `Staged ${product.item_name}`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Badge: Mode Indicator */}
          <div className="absolute top-14 sm:top-16 left-3 sm:left-4 z-20 flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-2xl bg-slate-900/85 border border-cyan-500/40 backdrop-blur-xl shadow-xl flex items-center gap-1.5 text-[11px] font-mono text-white">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="font-bold">
                {showOriginal ? "Original Room Photo" : "✨ AI Virtual Staging"}
              </span>
            </div>

            {/* Before / After Toggle Button */}
            {roomImage && (
              <button
                onMouseDown={() => setShowOriginal(true)}
                onMouseUp={() => setShowOriginal(false)}
                onTouchStart={() => setShowOriginal(true)}
                onTouchEnd={() => setShowOriginal(false)}
                className="px-3 py-1.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-xl text-[11px] font-mono shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                title="Hold to see original room photo"
              >
                <Eye className="w-3 h-3 text-cyan-300" />
                <span>Hold for Before</span>
              </button>
            )}
          </div>

          {/* Action Footer Over Staged Image */}
          <div className="absolute bottom-16 sm:bottom-20 inset-x-0 mx-auto w-fit z-30 flex items-center gap-2 px-3 pointer-events-auto">
            <button
              onClick={handleGenerateStaging}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-full bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-xl shadow-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Regenerate Staging"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Re-stage</span>
            </button>

            <button
              onClick={handleAddToCartClick}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl transition-all cursor-pointer active:scale-95 ${
                isAdded
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add ${product.price_bundle}</span>
                </>
              )}
            </button>

            {onLaunchAR && (
              <button
                onClick={onLaunchAR}
                className="px-3.5 py-2 rounded-full bg-slate-900/85 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/40 backdrop-blur-xl shadow-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>AR QuickLook</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Unstaged State: Prompt to Generate */
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
          {roomImage && (
            <img
              src={roomImage}
              alt="Room Base"
              className="absolute inset-0 w-full h-full object-cover filter blur-[2px] opacity-40"
            />
          )}

          <div className="relative z-10 max-w-md w-full bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl text-center flex flex-col items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight mb-1">
                AI Virtual Staging Preview
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generate a photorealistic visualization of your room staged with the{" "}
                <strong className="text-cyan-300 font-semibold">{product.item_name}</strong> using Google Gemini 2.5 Image engine.
              </p>
            </div>

            {errorMessage && (
              <div className="w-full p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-left line-clamp-2">{errorMessage}</span>
              </div>
            )}

            <button
              id="generate-staging-btn"
              onClick={handleGenerateStaging}
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Generating Staged Room (5–8s)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{roomImage ? "Generate Staging for My Room" : "Generate AI Staging Preview"}</span>
                </>
              )}
            </button>

            <p className="text-[11px] font-mono text-slate-400">
              {roomImage
                ? "✨ Photorealistic staging generated using your real scanned room."
                : "Tip: Tap to preview staging in a matching interior, or tap 'Scan Room' for your real room."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
