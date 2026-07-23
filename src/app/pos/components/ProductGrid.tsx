"use client";

import { POSProduct } from "@/types/pos";
import ProductCard from "./ProductCard";
import { Search } from "@boxicons/react";

interface ProductGridProps {
  products: POSProduct[];
  onAdd: (product: POSProduct) => void;
}

/**
 * Cuadrícula de productos del POS.
 * Renderiza una tarjeta por producto o un mensaje vacío si no hay resultados.
 */
export default function ProductGrid({ products, onAdd }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
        <Search size="lg"/>
        <p className="text-sm font-medium">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </div>
  );
}