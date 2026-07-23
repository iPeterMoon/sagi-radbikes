import { ProductoCarritoDTO } from "./ProductoCarritoDTO";

/** 
 * Payload de entrada esperado por el servicio para registrar y procesar una venta completa.
 */
export interface CrearVentaDTO {
    /** Identificador del cajero o vendedor responsable de la transacción */
    idUsuario: string;
    /** Canal de pago seleccionado (ej. Efectivo, Tarjeta, Transferencia) */
    metodoPago: string;
    /** Lista de los productos y cantidades a facturar */
    productos: ProductoCarritoDTO[];
    /** Tasa de impuestos aplicable a la transacción total (ej. 16 para el 16% de IVA) */
    porcentajeImpuesto: number;
}