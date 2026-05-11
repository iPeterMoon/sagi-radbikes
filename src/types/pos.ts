/** Producto representado en el Punto de Venta. */
export interface POSProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  /** `null` indica stock ilimitado (ej. servicios de taller). */
  stock: number | null;
  image: string;
  sku: string;
}

/** Ítem dentro del carrito de compras del POS. */
export interface CartItem {
  product: POSProduct;
  /** Cantidad del producto en el carrito. */
  qty: number;
}

/** Método de pago seleccionado en el checkout del POS. */
export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia";

/** Categorías de producto disponibles en el POS. */
export type POSCategory =
  | "Todas"
  | "Bicicletas"
  | "Componentes"
  | "Accesorios"
  | "Taller";

/** DTO de información de pago en la respuesta de venta. */
export interface PagoDTO {
  idPago: string;
  metodoPago: string;
  monto: number;
  fechaHora: Date;
  idVenta: string;
}

/** DTO de resumen de venta después del checkout exitoso. */
export interface VentaResumenDTO {
  idVenta: string;
  total: number;
  mensaje: string;
  estado: string;
  fecha: Date;
  folio: string;
  subtotal: number;
  importeIVA: number;
  porcentajeImpuesto: number;
  pago: PagoDTO;
}