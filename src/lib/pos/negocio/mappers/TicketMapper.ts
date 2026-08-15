import { VentaTicketDTO } from "../DTOsSalida/VentaTicketDTO";

/**
 * Transforma la entidad cruda de venta (con sale_details y payments incluidos)
 * en el DTO que consume el constructor de tickets térmicos.
 */
export class TicketMapper {
  static toTicketDTO(venta: any): VentaTicketDTO {
    return {
      folio: venta.folio,
      fecha: venta.created_at ?? new Date(),
      subtotal: Number(venta.subtotal),
      importeIVA: Number(venta.IVA_amount),
      porcentajeImpuesto: Number(venta.tax_percentage),
      total: Number(venta.total),
      metodoPago: venta.payments?.[0]?.paymentMethod ?? "N/A",
      items: venta.sale_details.map((d: any) => ({
        nombre: d.product_variants?.products?.name ?? `Producto ${d.variant_id}`,
        cantidad: d.quantity,
        precioUnitario: Number(d.unitPrice),
        atributos:
          (d.product_variants?.product_variant_attributes ?? [])
            .map((a: any) => `${a.name}: ${a.value}`)
            .join(", ") || undefined,
      })),
    };
  }
}