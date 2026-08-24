/** Totales de ventas de un período (hoy, semana o mes). */
export interface VentasPeriodoDTO {
  /** Suma de los totales de venta del período. */
  total: number;
  /** Número de ventas registradas en el período. */
  cantidadVentas: number;
}

/** Margen de ganancia de un período (hoy, semana o mes). */
export interface MargenPeriodoDTO {
  /** Ganancia total del período: suma de (precio - costo) × cantidad. */
  montoMargen: number;
  /** Margen como porcentaje de los ingresos del período (0-100). */
  porcentajeMargen: number;
}

/** Fila de la tabla de productos más vendidos. */
export interface TopProductoDTO {
  nombre: string;
  sku: string;
  unidadesVendidas: number;
  ingresos: number;
}

/**
 * Resumen de KPIs del dashboard: ventas, productos más vendidos y margen,
 * desglosados por hoy, semana y mes en curso.
 */
export interface DashboardResumenDTO {
  ventas: {
    hoy: VentasPeriodoDTO;
    semana: VentasPeriodoDTO;
    mes: VentasPeriodoDTO;
  };
  topProductos: TopProductoDTO[];
  margen: {
    hoy: MargenPeriodoDTO;
    semana: MargenPeriodoDTO;
    mes: MargenPeriodoDTO;
  };
}
