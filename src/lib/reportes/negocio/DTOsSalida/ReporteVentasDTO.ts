/** Fila del ranking de productos más vendidos dentro del rango del reporte. */
export interface TopProductoReporteDTO {
  nombre: string;
  sku: string;
  unidadesVendidas: number;
  ingresos: number;
}

/** Totales de un día dentro del rango del reporte. */
export interface VentaPorDiaDTO {
  /** Fecha del día, formato "YYYY-MM-DD". */
  fecha: string;
  total: number;
  cantidadVentas: number;
}

/** Fila del listado detallado de ventas individuales dentro del rango. */
export interface VentaDetalleDTO {
  folio: string;
  /** Fecha y hora de la venta en formato ISO 8601. */
  fecha: string;
  vendedor: string;
  metodoPago: string;
  total: number;
}

/** Resumen agregado de KPIs del rango del reporte. */
export interface ResumenReporteVentasDTO {
  total: number;
  cantidadVentas: number;
  montoMargen: number;
  porcentajeMargen: number;
}

/**
 * Reporte de ventas completo para un rango de fechas: resumen de KPIs,
 * productos más vendidos, desglose diario y listado detallado de ventas.
 */
export interface ReporteVentasDTO {
  desde: string;
  hasta: string;
  resumen: ResumenReporteVentasDTO;
  topProductos: TopProductoReporteDTO[];
  ventasPorDia: VentaPorDiaDTO[];
  ventas: VentaDetalleDTO[];
}
