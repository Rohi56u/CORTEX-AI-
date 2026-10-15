"use client";

import { useState } from "react";
import { SuggestedProduct } from "../types/neurocommerce";
import {
  Tag,
  Maximize,
  ShoppingBag,
  Sparkles,
  Check,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
} from "lucide-react";

interface BottomSKUCarouselProps {
  products: SuggestedProduct[];
  selectedSkuId: string;
  onSelectProduct: (product: SuggestedProduct) => void;
  onAddToCart?: (product: SuggestedProduct) => void;
  onAddAllBundle?: () => void;
  voiceSummary?: string;
}

export default function BottomSKUCarousel({
  products,
  selectedSkuId,
  onSelectProduct,
  onAddToCart,
  onAddAllBundle,
  voiceSummary,
}: BottomSKUCarouselProps) {
  const [addedSku, setAddedSku] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showVoiceCard, setShowVoiceCard] = useState(true);

  const selectedProduct = products.find((p) => p.sku_id === selectedSkuId) || products[0];

  const handleAddToCartClick = (e: React.MouseEvent, product: SuggestedProduct) => {
    e.stopPropagation();
    setAddedSku(product.sku_id);
    if (onAddToCart) {
      onAddToCart(product);
    }
    setTimeout(() => setAddedSku(null), 2000);
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-2 max-w-5xl mx-auto px-2 sm:px-3 pb-2 transition-all duration-300">
      {/* 1. Collapse / Expand Control Pill */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-xl text-[11px] font-mono shadow-md transition-all cursor-pointer active:scale-95"
        >
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>
            {isCollapsed
              ? `Catalog (${products.length}) • ${selectedProduct.item_name}`
              : `Hide Catalog`}
          </span>
          {isCollapsed ? (
            <ChevronUp className="w-3 h-3 text-cyan-400" />
          ) : (
            <ChevronDown className="w-3 h-3 text-slate-400" />
          )}
        </button>

        {isCollapsed && onAddToCart && (
          <button
            onClick={(e) => handleAddToCartClick(e, selectedProduct)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-[11px] shadow-md transition-all active:scale-95"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Add ${selectedProduct.price_bundle}</span>
          </button>
        )}
      </div>

      {/* 2. Expanded Carousel Area */}
      {!isCollapsed && (
        <div className="flex flex-col gap-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
          {/* Agent Voice AI Reasoning Card & 1-Click Room Bundle Banner */}
          {voiceSummary && showVoiceCard && (
            <div className="bg-slate-900/85 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-2.5 sm:p-3 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-slate-200 relative">
              <button
                onClick={() => setShowVoiceCard(false)}
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white rounded-md transition-colors"
                title="Dismiss Reasoning"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="flex items-start gap-2 sm:gap-2.5 flex-1 pr-6">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono uppercase text-[10px] tracking-wider text-cyan-400 font-semibold">
                      NeuroCommerce Spatial Engine
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      • 98.4% Match
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                    {voiceSummary}
                  </p>
                </div>
              </div>

              {onAddAllBundle && products.length > 1 && (
                <button
                  onClick={onAddAllBundle}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Buy Entire Room Set</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* SKU Carousel Row */}
          <div className="relative">
            <div className="flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
              {products.map((product) => {
                const isSelected = product.sku_id === selectedSkuId;
                const savings = Math.max(
                  0,
                  product.price_original - product.price_bundle
                );

                return (
                  <div
                    key={product.sku_id}
                    onClick={() => onSelectProduct(product)}
                    className={`snap-center shrink-0 w-64 sm:w-72 cursor-pointer rounded-2xl p-3 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between border ${
                      isSelected
                        ? "bg-slate-900/95 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50"
                        : "bg-slate-950/75 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/75"
                    }`}
                  >
                    <div>
                      {/* Top meta tags */}
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <span
                          className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-semibold ${
                            isSelected
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {product.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {product.rating && (
                            <span className="text-[10px] text-amber-300 font-mono flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                              <span>{product.rating}</span>
                            </span>
                          )}
                          {savings > 0 && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5 font-semibold">
                              <Tag className="w-2.5 h-2.5" />
                              Save ${savings}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Dimension */}
                      <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-1 mb-0.5">
                        {product.item_name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mb-1.5">
                        <Maximize className="w-2.5 h-2.5 text-slate-500" />
                        <span>
                          {product.dimensions_meters.width}m ×{" "}
                          {product.dimensions_meters.depth}m ×{" "}
                          {product.dimensions_meters.height}m
                        </span>
                      </div>

                      {/* AI Match snippet */}
                      <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1 leading-snug mb-2">
                        {product.reasoning}
                      </p>
                    </div>

                    {/* Bottom Pricing & Action */}
                    <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm sm:text-base font-extrabold text-white">
                            ${product.price_bundle}
                          </span>
                          {product.price_original > product.price_bundle && (
                            <span className="text-[10px] text-slate-500 line-through">
                              ${product.price_original}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleAddToCartClick(e, product)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all active:scale-95 ${
                          addedSku === product.sku_id
                            ? "bg-emerald-500 text-slate-950 font-bold"
                            : isSelected
                            ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        }`}
                      >
                        {addedSku === product.sku_id ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3 h-3" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
