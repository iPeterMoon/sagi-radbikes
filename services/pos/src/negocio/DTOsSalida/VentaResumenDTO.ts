import { PagoDTO } from "./PagoDTO";

export interface VentaResumenDTO {
  idVenta: string;
  total: number;
  mensaje: string;
  estado: string;
  fecha: Date;
  folio: string;
  subtotal: number;
  importeIVA: number;
  porcentajeImpuesto: number;
  pago: PagoDTO;
}
