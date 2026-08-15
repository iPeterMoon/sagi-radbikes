import Image from "next/image";
import { Product } from "@/types/inventory";
import { getWorstStockStatus, formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Toggle from "@/components/ui/Toggle";
import { IconEdit, IconTrash, IconSearch } from "@/components/ui/Icons";
import { ProductTableProps } from "@/types/inventory";

/**
 * Calcula el precio a mostrar para un producto con variantes: si no tiene
 * variantes o todas comparten el mismo precio, muestra ese valor; si varía,
 * muestra "Desde $X" con el precio mínimo entre sus variantes.
 */
function getDisplayPrice(product: Product): string {
  if (product.variants.length === 0) return "—";
  const prices = product.variants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `$${formatPrice(min)}` : `Desde $${formatPrice(min)}`;
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
}: ProductTableProps) {
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className={thLeftClass}>Producto</th>
            <th className={thClass}>Categoría</th>
            <th className={thClass}>Marca</th>
            <th className={thClass}>Precio</th>
            <th className={thClass}>Stock</th>
            <th className={thClass}>Estado</th>
            <th className={thClass}>Activo</th>
            <th className={thClass}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: Product) => {
            const activeVariants = product.variants.filter((v) => v.active);
            const totalStock = activeVariants.reduce(
              (acc, v) => acc + v.stock,
              0,
            );
            const status = getWorstStockStatus(activeVariants);
            const stockColor =
              status === "CRÍTICO"
                ? "text-red-500"
                : status === "BAJO"
                  ? "text-orange-500"
                  : "text-gray-700";

            return (
              <tr key={product.id} className="bg-white">
                {/* Sticky product column */}
                <td className={tdStickyClass}>
                  <div className="flex items-center gap-3">
                    <Image
                      src={product.image?.trim() ? product.image : "/placeholder.png"}
                      alt={product.name}
                      width={24}
                      height={24}
                      className="rounded-lg object-contain border border-gray-200 shrink-0"
                    />
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
    </div>
  );
}
