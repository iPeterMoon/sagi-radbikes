export interface POSProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number | null; // null = servicio / ilimitado
  image: string;
  sku: string;
}

export interface CartItem {
  product: POSProduct;
  qty: number;
}

export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia";

export type POSCategory =
  | "Todas"
  | "Bicicletas"
  | "Componentes"
  | "Accesorios"
  | "Taller";