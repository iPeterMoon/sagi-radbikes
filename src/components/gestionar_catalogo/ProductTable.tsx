import Image from "next/image";
import { Product } from "@/types/inventory";
import { getStockStatus, formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Toggle from "@/components/ui/Toggle";
import { IconEdit, IconTrash, IconSearch } from "@/components/ui/Icons";
import { ProductTableProps } from "@/types/inventory";

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onToggle,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="p-12 text-center text-gray-400">
        <IconSearch size={32} className="mx-auto" />
        <p className="mt-3 text-sm">No se encontraron productos</p>
      </div>
    );
  }

  const thClass =
    "px-3.5 py-2.5 text-[11px] font-bold text-gray-400 tracking-[0.06em] text-center uppercase border-b border-gray-200";
  const tdClass =
    "p-3.5 text-[13px] text-gray-700 border-b border-gray-100 align-middle";

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className={thClass}>Producto</th>
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
            const status = getStockStatus(product.stock, product.minStock);
            const stockColor =
              status === "CRÍTICO"
                ? "text-red-500"
                : status === "BAJO"
                  ? "text-orange-500"
                  : "text-gray-700";

            return (
              <tr key={product.id} className="bg-white">
                <td className={tdClass}>
                  <div className="flex items-center justify-center gap-3">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={44}
                      height={44}
                      className="rounded-lg object-cover border border-gray-200"
                    />
                    <div className="text-left">
                      {" "}
                      <div className="font-semibold text-gray-900 text-sm">
                        {product.name}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {product.sku}
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
                  ${formatPrice(product.price)}
                </td>
                <td
                  className={`${tdClass} text-center font-bold ${stockColor}`}
                >
                  {product.stock}
                </td>
                <td className={`${tdClass} text-center`}>
                  <Badge status={status} />
                </td>
                <td className={`${tdClass} text-center`}>
                  <div className="flex justify-center">
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
