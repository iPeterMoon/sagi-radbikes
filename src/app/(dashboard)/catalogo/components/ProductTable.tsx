"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Product, ProductSortKey, SortDirection } from "@/types/inventory";
import {
  formatPrice,
  getProductMinPrice,
  getProductStatus,
  getProductTotalStock,
} from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Toggle from "@/components/ui/Toggle";
import { IconEdit, IconTrash, IconSearch, IconX } from "@/components/ui/Icons";
import { ProductTableProps } from "@/types/inventory";
import { ChevronUp, ChevronDown } from "@boxicons/react";

/**
 * Calcula el precio a mostrar para un producto con variantes: si no tiene
 * variantes o todas comparten el mismo precio, muestra ese valor; si varía,
 * muestra "Desde $X" con el precio mínimo entre sus variantes.
 */
function getDisplayPrice(product: Product): string {
  if (product.variants.length === 0) return "—";
  const min = getProductMinPrice(product);
  const max = Math.max(...product.variants.map((v) => v.price));
  return min === max ? `$${formatPrice(min)}` : `Desde $${formatPrice(min)}`;
}

/** Encabezado de columna ordenable, con indicador de dirección accesible. */
function SortableHeader({
  label,
  columnKey,
  currentKey,
  direction,
  onSort,
  align = "center",
}: {
  label: string;
  columnKey: ProductSortKey;
  currentKey: ProductSortKey;
  direction: SortDirection;
  onSort: (key: ProductSortKey) => void;
  align?: "left" | "center";
}) {
  const active = currentKey === columnKey;
  return (
    <button
      type="button"
      onClick={() => onSort(columnKey)}
      className={`inline-flex items-center gap-1 cursor-pointer transition-colors hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-sm ${
        align === "left" ? "" : "justify-center"
      } ${active ? "text-gray-600" : ""}`}
    >
      {label}
      {active ? (
        direction === "asc" ? (
          <ChevronUp width={11} height={11} className="text-primary shrink-0" />
        ) : (
          <ChevronDown width={11} height={11} className="text-primary shrink-0" />
        )
      ) : (
        <span className="flex flex-col -space-y-[3px] text-gray-300 shrink-0">
          <ChevronUp width={9} height={9} />
          <ChevronDown width={9} height={9} />
        </span>
      )}
    </button>
  );
}

/** Vista ampliada de la imagen de un producto, abierta al hacer clic en su miniatura. */
function ImageLightbox({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Imagen de ${product.name}`}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-1000 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)] w-[min(92vw,440px)]"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {product.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <IconX size={16} />
          </button>
        </div>
        <div className="bg-gray-50 flex items-center justify-center p-6">
          <Image
            src={product.image?.trim() ? product.image : "/placeholder.png"}
            alt={product.name}
            width={480}
            height={480}
            className="max-h-[55vh] w-auto h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Tabla de productos del catálogo.
 * Muestra imagen, nombre, cantidad de variantes, categoría, marca, precio
 * (agregado desde sus variantes), stock total de variantes activas, estado y controles.
 * Si no hay productos muestra un mensaje de lista vacía.
 */
export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onToggle,
  sortKey,
  sortDirection,
  onSort,
}: ProductTableProps) {
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  if (products.length === 0) {
    return (
      <div className="p-12 text-center text-gray-400 flex flex-col items-center">
        <IconSearch size={32} />
        <p className="mt-3 text-sm">No se encontraron productos</p>
      </div>
    );
  }

  const thClass =
    "px-3.5 py-2.5 text-[11px] font-bold text-gray-400 tracking-[0.06em] text-center uppercase border-b border-gray-200";
  const thLeftClass =
    "px-3.5 py-2.5 text-[11px] font-bold text-gray-400 tracking-[0.06em] text-left uppercase border-b border-gray-200 sticky left-0 z-10 bg-gray-50";
  const tdClass =
    "p-3.5 text-[13px] text-gray-700 border-b border-gray-100 align-middle";
  const tdStickyClass =
    "p-3.5 text-[13px] text-gray-700 border-b border-gray-100 align-middle sticky left-0 z-10 bg-white";

  const ariaSortFor = (key: ProductSortKey) =>
    sortKey === key
      ? sortDirection === "asc"
        ? ("ascending" as const)
        : ("descending" as const)
      : ("none" as const);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className={thLeftClass} aria-sort={ariaSortFor("nombre")}>
              <SortableHeader
                label="Producto"
                columnKey="nombre"
                currentKey={sortKey}
                direction={sortDirection}
                onSort={onSort}
                align="left"
              />
            </th>
            <th className={thClass}>Categoría</th>
            <th className={thClass}>Marca</th>
            <th className={thClass} aria-sort={ariaSortFor("precio")}>
              <SortableHeader
                label="Precio"
                columnKey="precio"
                currentKey={sortKey}
                direction={sortDirection}
                onSort={onSort}
              />
            </th>
            <th className={thClass} aria-sort={ariaSortFor("stock")}>
              <SortableHeader
                label="Stock"
                columnKey="stock"
                currentKey={sortKey}
                direction={sortDirection}
                onSort={onSort}
              />
            </th>
            <th className={thClass} aria-sort={ariaSortFor("estado")}>
              <SortableHeader
                label="Estado"
                columnKey="estado"
                currentKey={sortKey}
                direction={sortDirection}
                onSort={onSort}
              />
            </th>
            <th className={thClass}>Activo</th>
            <th className={thClass}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: Product) => {
            const totalStock = getProductTotalStock(product);
            const status = getProductStatus(product);
            const stockColor =
              status === "CRÍTICO"
                ? "text-red-500"
                : status === "BAJO"
                  ? "text-orange-500"
                  : "text-gray-700";

            return (
              <tr
                key={product.id}
                className="bg-white hover:bg-gray-50/60 transition-colors"
              >
                {/* Sticky product column */}
                <td className={tdStickyClass}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewProduct(product)}
                      aria-label={`Ver imagen de ${product.name}`}
                      className="group relative w-11 h-11 rounded-lg border border-gray-200 bg-white shrink-0 overflow-hidden cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    >
                      <Image
                        src={
                          product.image?.trim()
                            ? product.image
                            : "/placeholder.png"
                        }
                        alt={product.name}
                        width={44}
                        height={44}
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/45 transition-colors">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconSearch size={14} />
                        </span>
                      </span>
                    </button>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 text-sm">
                        {product.name}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        <span className="inline-block bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">
                          {product.variants.length} variante
                          {product.variants.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className={`${tdClass} text-center`}>
                  <div>{product.category}</div>
                  <div className="text-[11px] text-gray-400">
                    {product.subcategory}
                  </div>
                </td>
                <td className={`${tdClass} text-center`}>{product.brand}</td>
                <td className={`${tdClass} text-center font-semibold`}>
                  {getDisplayPrice(product)}
                </td>
                <td className={`${tdClass} text-center font-bold ${stockColor}`}>
                  {totalStock}
                </td>
                <td className={`${tdClass} text-center`}>
                  <Badge status={status} />
                </td>
                <td className={`${tdClass} text-center`}>
                  <div
                    id="estadoProducto"
                    className="flex justify-center"
                  >
                    <Toggle
                      checked={product.active}
                      onChange={() => onToggle(product.id)}
                    />
                  </div>
                </td>
                <td className={`${tdClass} text-center`}>
                  <div className="flex gap-1.5 justify-center">
                    <button
                      onClick={() => onEdit(product)}
                      title="Editar"
                      className="w-7 h-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <IconEdit />
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      title="Eliminar"
                      className="w-7 h-7 rounded-md border border-red-200 bg-white flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {previewProduct && (
        <ImageLightbox
          product={previewProduct}
          onClose={() => setPreviewProduct(null)}
        />
      )}
    </div>
  );
}
