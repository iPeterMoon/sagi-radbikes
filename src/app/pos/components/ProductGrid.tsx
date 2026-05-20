"use client";

import { POSProduct } from "@/types/pos";
import ProductCard from "./ProductCard";
import { Search } from "@boxicons/react";

export function parseProductsFromXml(xmlString: string): POSProduct[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error(parserError.textContent || "XML inválido");
  }

  return Array.from(xmlDoc.querySelectorAll("productos > producto")).map((producto) => {
    const id = Number(producto.querySelector("idProducto")?.textContent?.trim() || "0");
    const name = producto.querySelector("nombre")?.textContent?.trim() || "";
    const price = Number(producto.querySelector("precio")?.textContent?.trim() || "0");
    const stock = Number(producto.querySelector("stock")?.textContent?.trim() || "0");
    const image = producto.querySelector("urlImagen")?.textContent?.trim() || "/placeholder.png";
    const sku = producto.querySelector("SKU")?.textContent?.trim() || "";
    const category = producto.querySelector("categoria > nombre")?.textContent?.trim() || "Sin categoría";

    return {
      id,
      name,
      price,
      stock,
      image,
      sku,
      category,
    };
  });
}

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