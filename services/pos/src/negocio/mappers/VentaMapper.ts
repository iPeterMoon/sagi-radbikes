import { VentaResumenDTO } from "../DTOsSalida/VentaResumenDTO";
import { PagoDTO } from "../DTOsSalida/PagoDTO";

export class VentaMapper {
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