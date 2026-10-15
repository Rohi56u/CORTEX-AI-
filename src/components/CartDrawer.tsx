"use client";

import { useState } from "react";
import { CartItem, SuggestedProduct } from "../types/neurocommerce";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Tag,
  CreditCard,
  Layers,
} from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  allProducts: SuggestedProduct[];
  onUpdateQuantity: (skuId: string, delta: number) => void;
  onRemoveItem: (skuId: string) => void;
  onAddAllBundle: () => void;
  roomType?: string;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  allProducts,
  onUpdateQuantity,
  onRemoveItem,
  onAddAllBundle,
  roomType = "living room",
}: CartDrawerProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const subtotalOriginal = items.reduce(
    (sum, item) => sum + item.product.price_original * item.quantity,
    0
  );
  const subtotalBundle = items.reduce(
    (sum, item) => sum + item.product.price_bundle * item.quantity,
    0
  );
  const totalSavings = Math.max(0, subtotalOriginal - subtotalBundle);

  const isFullRoomBundle =
    items.length >= 2 &&
    allProducts.every((p) => items.some((i) => i.product.sku_id === p.sku_id));

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderConfirmed(true);
    }, 1200);
  };

  const handleReset = () => {
    setOrderConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 flex justify-end">
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-700/80 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Spatial Cart
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                  {items.reduce((acc, i) => acc + i.quantity, 0)} Items
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Room Clearance & Proportions Verified
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderConfirmed ? (
          /* Order Confirmation View */
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">
              Order Confirmed & Reserved!
            </h4>
            <p className="text-xs text-slate-400 mb-4 max-w-xs leading-relaxed">
              Order #NC-{(Math.random() * 90000 + 10000).toFixed(0)} has been
              dispatched for White-Glove In-Room Delivery. Your WebXR room anchor
              is saved with delivery instructions.
            </p>
            <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left text-xs mb-6 space-y-2 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Total Paid:</span>
                <span className="text-white font-bold">${subtotalBundle}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Spatial Guarantee:</span>
                <span className="text-emerald-400">100% Fit Guaranteed</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Arrival:</span>
                <span className="text-cyan-300">3-5 Business Days</span>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              Back to 3D Spatial Studio
            </button>
          </div>
        ) : (
          <>
            {/* Spatial Fit Guarantee Alert Banner */}
            <div className="bg-emerald-950/40 border-b border-emerald-500/30 px-4 py-2.5 flex items-center gap-2.5 text-xs text-emerald-300 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] leading-tight">
                AI Fit Guarantee: Scaled to fit your {roomType} dimensions.
              </span>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
                  <ShoppingBag className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-xs font-mono">Your cart is empty.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Select a 3D furniture piece below and click "Add".
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.sku_id}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {item.product.category}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">
                          {item.product.item_name}
                        </h4>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {item.product.dimensions_meters.width}m W ×{" "}
                          {item.product.dimensions_meters.depth}m D ×{" "}
                          {item.product.dimensions_meters.height}m H
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.sku_id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Finishes Swatch if available */}
                    {item.product.available_finishes && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>Finish:</span>
                        <span className="text-slate-300 font-medium">
                          {item.selectedFinish ||
                            item.product.available_finishes[0].name}
                        </span>
                      </div>
                    )}

                    {/* Bottom Pricing & Quantity */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-white font-mono">
                          ${item.product.price_bundle * item.quantity}
                        </span>
                        {item.product.price_original >
                          item.product.price_bundle && (
                          <span className="text-[11px] text-slate-500 line-through font-mono">
                            ${item.product.price_original * item.quantity}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.product.sku_id, -1)
                          }
                          className="p-1 hover:text-white text-slate-400 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white font-mono w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.product.sku_id, 1)
                          }
                          className="p-1 hover:text-white text-slate-400 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* 1-Click "Add Complete Room Bundle" Promotion if not all added */}
              {!isFullRoomBundle && allProducts.length > 1 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-500/40 flex flex-col gap-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-cyan-300 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Complete Curated Room
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Bundle Savings
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Add the matching coffee table and sculptural chair to
                    complete the spatial layout.
                  </p>
                  <button
                    onClick={onAddAllBundle}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all mt-1"
                  >
                    <span>✦ Add Complete Room Set</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-col gap-3">
                {/* Financial Summary */}
                <div className="space-y-1.5 text-xs font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-white">${subtotalOriginal}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Room Bundle Discount:</span>
                      <span>-${totalSavings}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-cyan-400" /> In-Room Delivery:
                    </span>
                    <span className="text-emerald-400 font-bold">FREE</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                    <span>Total:</span>
                    <span className="text-base text-cyan-300">
                      ${subtotalBundle}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 text-right">
                    or 4 payments of ${(subtotalBundle / 4).toFixed(0)}/mo with
                    Klarna / Affirm
                  </div>
                </div>

                {/* Express Checkout & Action */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isCheckingOut ? (
                      <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Proceed to Secure Checkout</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 font-mono pt-1">
                    <span>🔒 256-Bit SSL</span>
                    <span>•</span>
                    <span>30-Day In-Home Trial</span>
                    <span>•</span>
                    <span>Fit Guarantee</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
