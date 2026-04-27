"use client";

import Image from "next/image";
import { POSProduct } from "@/types/pos";
import { formatPrice } from "@/lib/utils";
import { Plus } from "@boxicons/react";

interface ProductCardProps {
  product: POSProduct;
  onAdd: (product: POSProduct) => void;
}

/**
 * Tarjeta de producto en la cuadrícula del POS.
 * Muestra la imagen, nombre, categoría, precio y botón de agregar al carrito.
 * Si el stock es 0, la tarjeta se muestra deshabilitada.
 */
export default function ProductCard({ product, onAdd }: ProductCardProps) {
  const outOfStock = product.stock !== null && product.stock === 0;
  const stockLabel = product.stock === null ? "∞" : `${product.stock}`;

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
        outOfStock ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          width={300}
          height={180}
          className="w-full h-[130px] object-cover"
        />
        {/* Stock badge */}
        <span className="absolute top-2 right-2 bg-black/55 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none backdrop-blur-sm">
          {stockLabel} u.
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="font-semibold text-gray-900 text-[13px] leading-snug mb-0.5 line-clamp-2">
          {product.name}
        </p>
        <p className="text-[11px] text-gray-400 mb-3">{product.category}</p>

        {/* Price + Add button */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[#1a2e5a] font-extrabold text-[15px]">
            ${formatPrice(product.price)}
          </span>
          <button
            onClick={() => onAdd(product)}
            disabled={outOfStock}
            className="w-7 h-7 rounded-lg bg-[#1a2e5a] text-white flex items-center justify-center text-lg font-bold leading-none cursor-pointer hover:bg-[#253d75] active:scale-95 transition-all border-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
          <Plus size="sm"/>
          </button>
        </div>
      </div>
    </div>
  );
}