export interface VentaTicketDTO {
  folio: string;
  fecha: Date;
  subtotal: number;
  importeIVA: number;
  porcentajeImpuesto: number;
  total: number;
  metodoPago: string;
  items: Array<{
    nombre: string;
    cantidad: number;
    precioUnitario: number;
  }>;
}