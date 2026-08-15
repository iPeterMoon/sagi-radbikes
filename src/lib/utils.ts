import { StockStatus } from "@/types/inventory";

/**
 * Calcula el estado de stock de una variante.
 * - NORMAL: `minStock` es `null` (notificaciones de stock bajo desactivadas)
 * - CRÍTICO: stock 0 o ≤ 50% del mínimo
 * - BAJO: stock ≤ mínimo
 * - NORMAL: stock > mínimo
 * @param stock - Cantidad actual en inventario
 * @param minStock - Cantidad mínima configurada, o `null` si está desactivada
 * @returns Estado de stock como `StockStatus`
 */
export function getStockStatus(
  stock: number,
  minStock: number | null,
): StockStatus {
  if (minStock == null) return "NORMAL";
  if (stock <= 0) return "CRÍTICO";
  if (stock <= minStock * 0.5) return "CRÍTICO";
  if (stock <= minStock) return "BAJO";
  return "NORMAL";
}

const STOCK_STATUS_RANK: Record<StockStatus, number> = {
  NORMAL: 0,
  BAJO: 1,
  "CRÍTICO": 2,
};

/**
 * Calcula el peor estado de stock entre un conjunto de variantes, ignorando
 * aquellas con notificaciones desactivadas (`minStock == null`). Cada variante
 * tiene su propio umbral, por lo que el estado agregado no puede calcularse
 * sumando los mínimos entre variantes distintas.
 * @param variantes - Variantes a evaluar (ya filtradas por activas si corresponde)
 * @returns El estado más severo entre las variantes, o `"NORMAL"` si ninguna tiene umbral
 */
export function getWorstStockStatus(
  variantes: { stock: number; minStock: number | null }[],
): StockStatus {
  let peor: StockStatus = "NORMAL";
  for (const v of variantes) {
    const estado = getStockStatus(v.stock, v.minStock);
    if (STOCK_STATUS_RANK[estado] > STOCK_STATUS_RANK[peor]) peor = estado;
  }
  return peor;
}

/**
 * Formatea un número como precio en pesos mexicanos con dos decimales.
 * @param price - Monto a formatear
 * @returns Cadena formateada (ej. "1,234.50")
 */
export function formatPrice(price: number): string {
  return price.toLocaleString("es-MX", { minimumFractionDigits: 2 });
}

