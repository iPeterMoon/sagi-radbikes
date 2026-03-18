import { StockStatus } from "@/types/inventory";

export function getStockStatus(stock: number, minStock: number): StockStatus {
  if (stock <= 0) return "CRÍTICO";
  if (stock <= minStock * 0.5) return "CRÍTICO";
  if (stock <= minStock) return "BAJO";
  return "NORMAL";
}

export function formatPrice(price: number): string {
  return price.toLocaleString("es-MX", { minimumFractionDigits: 2 });
}
