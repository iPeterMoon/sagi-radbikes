import { VentaResumenDTO } from "../DTOsSalida/VentaResumenDTO";
import { PagoDTO } from "../DTOsSalida/PagoDTO";

/**
 * Clase utilitaria encargada de transformar entidades de base de datos relacionadas con
 * ventas y pagos en Objetos de Transferencia de Datos (DTOs) para la capa de presentación.
 */
export class VentaMapper {

  /**
   * Convierte la información cruda de una venta y su pago asociado en un DTO de resumen.
   * @param {any} venta - Objeto crudo de la venta obtenido de la base de datos.
   * @param {any} pago - Objeto crudo del pago asociado a la venta.
   * @param {number} subtotal - Monto subtotal calculado de la venta (sin impuestos).
   * @param {number} importeIVA - Monto total del impuesto (IVA) calculado.
   * @returns {VentaResumenDTO} DTO estructurado con el resumen completo de la transacción.
   */
  static toResumenDTO(venta: any, pago: any, subtotal: number, importeIVA: number): VentaResumenDTO {
    const pagoDTO: PagoDTO = {
      idPago: String(pago.id),
      metodoPago: pago.paymentMethod ?? "",
      monto: pago.amount ?? 0,
      fechaHora: pago.created_at ?? new Date(),
      idVenta: String(pago.sale_id),
    };

    return {
      idVenta: String(venta.id),
      total: Number(venta.total),
      subtotal,
      importeIVA,
      porcentajeImpuesto: Number(venta.tax_percentage),
      folio: venta.folio,
      fecha: venta.created_at ?? new Date(),
      estado: "completada",
      mensaje: "Venta registrada exitosamente",
      pago: pagoDTO,
    };
  }
}