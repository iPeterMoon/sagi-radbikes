/**
 * Data Transfer Object que representa una variante de producto individual
 * almacenada dentro del estado del carrito en memoria.
 */
export interface ProductoCarritoDTO {
    /** Identificador único de la variante */
    idVariante: string;
    /** Nombre descriptivo del artículo */
    nombre: string;
    /** Unidades seleccionadas para la compra */
    cantidad: number;
    /** Precio del producto por unidad */
    precioUnitario: number;
    /** Monto acumulado de este producto (precioUnitario * cantidad) */
    subtotal: number;
    /** URL de la imagen del producto */
    urlImagen: string;
}
