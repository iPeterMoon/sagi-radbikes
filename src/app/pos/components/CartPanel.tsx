"use client";

import { CartItem, PaymentMethod } from "@/types/pos";
import { formatPrice } from "@/lib/utils";
import { CartAlt, ChevronRight } from "@boxicons/react";
import CartItemRow from "./CartItemRow";
import PaymentMethodSelector from "./PaymentMethodSelector";
import { IVA_RATE } from "@/lib/mockProducts";

interface CartPanelProps {
  cart: CartItem[];
  paymentMethod: PaymentMethod;
  onPaymentChange: (method: PaymentMethod) => void;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  /** Vacía todos los ítems del carrito. */
  onClear: () => void;
  /** Procesa el cobro de la venta. */
  onCheckout: () => void;
}

/**
 * Panel lateral del carrito en el POS.
 * Muestra los productos agregados, subtotal, IVA, total,
 * selector de método de pago y botón de cobrar.
 */
export default function CartPanel({
  cart,
  paymentMethod,
  onPaymentChange,
  onIncrement,
  onDecrement,
  onClear,
  onCheckout,
}: CartPanelProps) {
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;

  const hasItems = cart.length > 0;

  return (
    <aside className="w-[330px] shrink-0 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      {/* ── Header ── */}
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-gray-700">
            <CartAlt size="sm" className="text-blue-800"/>
          </span>
          <h2 className="font-bold text-gray-900 text-[15px]">Carrito</h2>
          {hasItems && (
            <span className="bg-[#1a2e5a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          )}
        </div>
        {hasItems && (
          <button
            onClick={onClear}
            className="text-[#1a2e5a] text-[12px] font-bold cursor-pointer bg-transparent border-none hover:text-red-500 transition-colors uppercase tracking-wide"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* ── Cart items ── */}
      <div className="flex-1 overflow-y-auto px-5 py-1">
        {!hasItems ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-300 gap-2">
            <CartAlt size="md"/>
            <p className="text-sm text-gray-400 font-medium">Carrito vacío</p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItemRow
              key={item.product.id}
              item={item}
              onIncrement={() => onIncrement(item.product.id)}
              onDecrement={() => onDecrement(item.product.id)}
            />
          ))
        )}
      </div>

      {/* ── Footer: payment + totals + CTA ── */}
      <div className="border-t border-gray-100 px-5 pt-4 pb-5 shrink-0">
        {/* Payment method */}
        <PaymentMethodSelector
          selected={paymentMethod}
          onChange={onPaymentChange}
        />

        {/* Totals */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[13px] text-gray-500">
            <span>Subtotal</span>
            <span className="tabular-nums">${formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[13px] text-gray-500">
            <span>IVA (16%)</span>
            <span className="tabular-nums">${formatPrice(iva)}</span>
          </div>
          <div className="flex justify-between items-center text-[17px] font-extrabold text-gray-900 pt-2.5 border-t border-gray-100 mt-2">
            <span>Total</span>
            <span className="tabular-nums">${formatPrice(total)}</span>
          </div>
        </div>

        {/* Checkout button */}
        <button
          disabled={!hasItems}
          onClick={onCheckout}
          className="mt-4 w-full py-3.5 rounded-xl bg-[#1a2e5a] text-white text-[14px] font-extrabold cursor-pointer hover:bg-[#253d75] active:scale-[0.98] transition-all flex items-center justify-between px-5 disabled:opacity-40 disabled:cursor-not-allowed shadow-md border-none"
        >
          <span>Cobrar</span>
          <div className="flex items-center gap-2">
            <span className="tabular-nums">${formatPrice(total)}</span>
            <ChevronRight size="sm" />
          </div>
        </button>
      </div>
    </aside>
  );
}