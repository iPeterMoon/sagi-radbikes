"use client";

import Image from "next/image";
import { CartItem } from "@/types/pos";
import { formatPrice } from "@/lib/utils";

interface CartItemRowProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
}

/**
 * Fila de ítem dentro del carrito del POS.
 * Muestra imagen, nombre, precio unitario, controles de cantidad y subtotal.
 */
export default function CartItemRow({
  item,
  onIncrement,
  onDecrement,
}: CartItemRowProps) {
  const subtotal = item.product.price * item.qty;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Product image */}
      <Image
        src={item.product.image}
        alt={item.product.name}
        width={48}
        height={48}
        className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
      />

      {/* Name + price */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 leading-snug truncate">
          {item.product.name}
        </p>
        <p className="text-[12px] text-gray-500 mt-0.5">
          ${formatPrice(item.product.price)}
        </p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onDecrement}
          className="w-6 h-6 rounded-md border border-gray-200 bg-white text-gray-600 text-sm font-bold flex items-center justify-center cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          −
        </button>
        <span className="w-5 text-center text-[13px] font-bold text-gray-900 tabular-nums">
          {item.qty}
        </span>
        <button
          onClick={onIncrement}
          className="w-6 h-6 rounded-md border border-gray-200 bg-white text-gray-600 text-sm font-bold flex items-center justify-center cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <p className="text-[13px] font-bold text-gray-900 w-16 text-right shrink-0 tabular-nums">
        ${formatPrice(subtotal)}
      </p>
    </div>
  );
}