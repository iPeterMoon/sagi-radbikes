/** Representación segura del pago realizado en una venta. */
export interface PagoDTO {
  /** ID del registro del pago */
  idPago: string;
  /** Método utilizado (Efectivo, TD, TC, etc.) */
  metodoPago: string;
  /** Cantidad cobrada/pagada */
  monto: number;
  /** Fecha del cobro */
  fechaHora: Date;
  /** Relación a la venta principal */
  idVenta: string;
}