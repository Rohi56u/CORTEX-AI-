"use client";

import { useState, useEffect } from "react";
import ARViewport from "@/components/ARViewport";
import ModeSwitchHUD from "@/components/ModeSwitchHUD";
import LightingToggle from "@/components/LightingToggle";
import BottomSKUCarousel from "@/components/BottomSKUCarousel";
import CameraCapture from "@/components/CameraCapture";
import CartDrawer from "@/components/CartDrawer";
import { CATALOG_PRODUCTS } from "@/lib/gemini";
import {
  SuggestedProduct,
  NeuroCommerceAIResponse,
  SpatialDimensions,
  CartItem,
} from "@/types/neurocommerce";
import {
  Camera,
  Cpu,
  Palette,
  Key,
  CheckCircle2,
  Sparkles,
  X,
  ExternalLink,
  ShoppingBag,
  Eye,
  EyeOff,
} from "lucide-react";

export default function NeuroCommercePage() {
  const [isStudioMode, setIsStudioMode] = useState(false);
  const [currentHdri, setCurrentHdri] = useState("/hdri/daylight_studio.hdr");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [activeApiKey, setActiveApiKey] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isZenMode, setIsZenMode] = useState(false);

  // E-Commerce Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Products and Selection
  const [products, setProducts] = useState<SuggestedProduct[]>(CATALOG_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<SuggestedProduct>(
    CATALOG_PRODUCTS[0]
  );

  // Spatial Analysis Telemetry
  const [spatialAnalysis, setSpatialAnalysis] = useState<SpatialDimensions>({
    estimated_room_type: "living_room",
    detected_wall_color: "#E5E1D8 Warm Sand",
    lighting_condition: "bright_daylight",
  });

  const [voiceSummary, setVoiceSummary] = useState<string>(
    "NeuroCommerce AI ready. Tap 'Scan Room' to analyze your space in 15 seconds with Gemini 1.5 Pro, or select furniture below."
  );

  // Load saved API key from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("GEMINI_API_KEY");
      if (saved) {
        setActiveApiKey(saved);
        setApiKeyInput(saved);
      }
    }
  }, []);

  const handleSaveApiKey = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("GEMINI_API_KEY", apiKeyInput.trim());
      setActiveApiKey(apiKeyInput.trim());
      setIsKeyModalOpen(false);
      showToast("Gemini API Key saved for this session!");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleAddToCart = (product: SuggestedProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.sku_id === product.sku_id);
      if (existing) {
        return prev.map((i) =>
          i.product.sku_id === product.sku_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.item_name} to cart`);
  };

  const handleUpdateQuantity = (skuId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => {
          if (i.product.sku_id === skuId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (skuId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.sku_id !== skuId));
  };

  const handleAddAllBundle = () => {
    setCartItems(
      products.map((p) => ({
        product: p,
        quantity: 1,
      }))
    );
    setIsCartOpen(true);
    showToast("Added complete curated room bundle (bundle discount applied)!");
  };

  const handleAnalysisResult = (result: NeuroCommerceAIResponse) => {
    if (result.spatial_analysis) {
      setSpatialAnalysis(result.spatial_analysis);
      if (result.spatial_analysis.lighting_condition === "dim_ambient") {
        setCurrentHdri("/hdri/warm_evening.hdr");
      } else {
        setCurrentHdri("/hdri/daylight_studio.hdr");
      }
    }

    if (result.recommended_primary_sku) {
      const allList = [
        result.recommended_primary_sku,
        ...(result.alternative_carousel_skus || []),
      ];
      setProducts(allList);
      setSelectedProduct(result.recommended_primary_sku);
    }

    if (result.agent_voice_summary) {
      setVoiceSummary(result.agent_voice_summary);
    }

    setHasScanned(true);
    const itemName = result.recommended_primary_sku?.item_name || "Furniture";
    showToast(`✨ Spatial Match Placed: ${itemName}`);
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <main className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-slate-950 flex flex-col justify-between pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
      {/* Background 3D / WebXR Viewport */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <ARViewport
          glbUrl={selectedProduct.model_glb_path}
          usdzUrl={selectedProduct.model_usdz_path}
          environmentHdri={currentHdri}
          isStudioMode={isStudioMode}
          boundingBox={selectedProduct.bounding_box_2d}
          productName={selectedProduct.item_name}
        />
      </div>

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="absolute top-14 sm:top-16 inset-x-0 mx-auto w-fit z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.4)] backdrop-blur-xl flex items-center gap-2 text-xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top HUD Navigation Bar (Hidden in Zen Clean View) */}
      {!isZenMode && (
        <header className="relative z-40 w-full px-2 sm:px-4 py-1.5 sm:py-2.5 flex items-center justify-between gap-1 pointer-events-none animate-in fade-in duration-200">
          {/* Brand & Mode Indicator */}
          <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
            <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl sm:rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 shadow-xl">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent font-mono">
                NEURO
              </span>
            </div>

            {/* Gemini Mode Indicator (Desktop only) */}
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className={`hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[10px] font-mono transition-all backdrop-blur-md cursor-pointer ${
                activeApiKey
                  ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300"
                  : "bg-slate-900/70 border-amber-500/40 text-amber-300 hover:border-amber-400"
              }`}
            >
              <Key className="w-3 h-3" />
              <span>{activeApiKey ? "Live Vision" : "Demo Key"}</span>
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto shrink-0">
            {/* Zen Mode: Hide all UI for 100% clean camera passthrough */}
            <button
              onClick={() => setIsZenMode(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-xl shadow-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1"
              title="Full-Screen Clean Camera View"
            >
              <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline text-[10px] font-mono">Clean</span>
            </button>

            {/* Dual Mode Switch (WebXR AR vs 3D Studio) */}
            <ModeSwitchHUD
              isStudioMode={isStudioMode}
              onToggleMode={setIsStudioMode}
            />

            {/* Day / Night HDRI Lighting Switch (Desktop only) */}
            <div className="hidden md:block">
              <LightingToggle
                currentHdri={currentHdri}
                onSelectHdri={setCurrentHdri}
              />
            </div>

            {/* 15s Room Scan Launcher Button */}
            <button
              onClick={() => setIsCameraOpen(true)}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.35)] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{hasScanned ? "Rescan" : "Scan"}</span>
            </button>

            {/* E-Commerce Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-xl shadow-xl flex items-center gap-1 transition-all cursor-pointer active:scale-95"
              title="Open Spatial Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
              {totalCartCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 font-bold text-[9px] font-mono flex items-center justify-center -mr-1 shadow-[0_0_8px_#22d3ee] animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </header>
      )}

      {/* Floating Restore UI Pill when in Zen Clean View */}
      {isZenMode && (
        <div className="absolute top-3 right-3 z-50 pointer-events-auto animate-in fade-in">
          <button
            onClick={() => setIsZenMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 backdrop-blur-xl shadow-2xl text-xs font-mono transition-all active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Show Controls</span>
          </button>
        </div>
      )}

      {/* Floating Spatial Spec Card (Left side on desktop only) */}
      {!isZenMode && (
        <div className="hidden lg:flex flex-col gap-2 absolute top-20 left-4 z-20 pointer-events-none">
          <div className="p-3 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 shadow-xl max-w-xs text-xs font-mono">
            <div className="flex items-center gap-1.5 text-cyan-400 mb-2 font-bold uppercase text-[10px] tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              <span>Spatial Telemetry</span>
            </div>
            <div className="space-y-1.5 text-slate-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Target SKU:</span>
                <span className="text-white font-bold">{selectedProduct.sku_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dimensions:</span>
                <span>
                  {selectedProduct.dimensions_meters.width}W × {selectedProduct.dimensions_meters.depth}D × {selectedProduct.dimensions_meters.height}H m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Surface Anchor:</span>
                <span className="text-emerald-400 font-semibold">Interactive Floor Anchor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lighting Profile:</span>
                <span className="text-amber-300 capitalize">{spatialAnalysis.lighting_condition.replace("_", " ")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Area: SKU Swiper Carousel (Auto-hidden in Zen Mode) */}
      {!isZenMode && (
        <footer className="relative z-30 w-full pointer-events-auto">
          <BottomSKUCarousel
            products={products}
            selectedSkuId={selectedProduct.sku_id}
            onSelectProduct={(product) => setSelectedProduct(product)}
            onAddToCart={handleAddToCart}
            onAddAllBundle={handleAddAllBundle}
            voiceSummary={voiceSummary}
          />
        </footer>
      )}

      {/* 15s Room & Voice Capture Modal */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onAnalysisComplete={handleAnalysisResult}
      />

      {/* E-Commerce Spatial Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        allProducts={products}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onAddAllBundle={handleAddAllBundle}
        roomType={spatialAnalysis.estimated_room_type.replace("_", " ")}
      />

      {/* Gemini API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold">
                <Key className="w-5 h-5 text-cyan-400" />
                <h3>Gemini 1.5 Pro API Key</h3>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              To have Gemini 1.5 Pro analyze your real room keyframes, paste your Google AI Studio API key below (or add <code className="text-cyan-300">GEMINI_API_KEY</code> to your <code className="text-cyan-300">.env.local</code> file).
            </p>

            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>Get API key from Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
