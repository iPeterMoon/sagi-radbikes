/**
 * DTO de entrada para generar un reporte de ventas en un rango de fechas.
 */
export interface FiltroReporteVentasDTO {
  /** Fecha de inicio del rango, formato "YYYY-MM-DD" (inclusive). */
  desde: string;
  /** Fecha de fin del rango, formato "YYYY-MM-DD" (inclusive). */
  hasta: string;
}
