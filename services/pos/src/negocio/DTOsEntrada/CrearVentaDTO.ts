import { ProductoCarritoDTO } from "./ProductoCarritoDTO";

/** DTO de entrada para registrar una venta. */
export interface CrearVentaDTO {
    idUsuario: string;
    metodoPago: string;
    productos: ProductoCarritoDTO[];
    porcentajeImpuesto: number;
}