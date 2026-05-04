/** Producto individual dentro del carrito al momento de crear una venta. */
export interface ProductoCarritoDTO {
  idProducto: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

/** DTO de entrada para registrar una venta. */
export interface CrearVentaDTO {
  idUsuario: string;
  metodoPago: string;
  productos: ProductoCarritoDTO[];
  porcentajeImpuesto: number;
}
