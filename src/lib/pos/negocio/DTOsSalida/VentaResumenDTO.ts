import { PagoDTO } from "./PagoDTO";

/**
 * Respuesta estructurada devuelta al cliente luego de que una venta es
 * procesada y registrada exitosamente en la base de datos.
 */
export interface VentaResumenDTO {
  /** Identificador único de base de datos para la transacción */
  idVenta: string;
  /** Monto total final (incluyendo impuestos) */
  total: number;
  /** Mensaje de estado (ej. "Venta registrada exitosamente") */
  mensaje: string;
  /** Estado de la transacción */
  estado: string;
  /** Marca de tiempo en que la venta fue concretada */
  fecha: Date;
  /** Folio único para tickets y consultas futuras */
  folio: string;
  /** Total calculado antes de aplicar el porcentaje del impuesto */
  subtotal: number;
  /** Monto monetario resultante del cálculo de impuestos */
  importeIVA: number;
  /** Porcentaje de impuestos empleado en los cálculos */
  porcentajeImpuesto: number;
  /** Detalles del pago emitido para esta venta */
  pago: PagoDTO;
}