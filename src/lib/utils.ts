import { StockStatus } from "@/types/inventory";

/**
 * Calcula el estado de stock de un producto.
 * - CRÍTICO: stock 0 o ≤ 50% del mínimo
 * - BAJO: stock ≤ mínimo
 * - NORMAL: stock > mínimo
 * @param stock - Cantidad actual en inventario
 * @param minStock - Cantidad mínima configurada para el producto
 * @returns Estado de stock como `StockStatus`
 */
export function getStockStatus(stock: number, minStock: number): StockStatus {
  if (stock <= 0) return "CRÍTICO";
  if (stock <= minStock * 0.5) return "CRÍTICO";
  if (stock <= minStock) return "BAJO";
  return "NORMAL";
}

/**
 * Formatea un número como precio en pesos mexicanos con dos decimales.
 * @param price - Monto a formatear
 * @returns Cadena formateada (ej. "1,234.50")
 */
export function formatPrice(price: number): string {
  return price.toLocaleString("es-MX", { minimumFractionDigits: 2 });
}
