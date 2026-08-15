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
    /** Texto de los atributos de la variante (ej. "Color: Rojo"), si aplica */
    atributos?: string;
  }>;
}