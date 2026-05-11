/** Producto individual dentro del carrito al momento de crear una venta. */
export interface ProductoCarritoDTO {
    idProducto: string;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}
