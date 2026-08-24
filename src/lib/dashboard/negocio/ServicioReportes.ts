import { ReporteDAO } from "../datos/ReporteDAO";
import {
  DashboardResumenDTO,
  VentasPeriodoDTO,
  MargenPeriodoDTO,
  TopProductoDTO,
} from "./DTOsSalida/DashboardResumenDTO";

const LIMITE_TOP_PRODUCTOS = 10;

/** Fila de detalle de venta con la variante/producto y la fecha de la venta ya resueltos. */
interface LineaVenta {
  soldAt: Date;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  nombreProducto: string;
  sku: string;
}

/**
 * Orquesta el cálculo de los KPIs del dashboard (ventas, productos más vendidos
 * y márgenes de ganancia) desglosados por hoy, semana y mes en curso.
 */
export class ServicioReportes {
  constructor(private dao: ReporteDAO) {}

  /**
   * Arma el resumen completo de KPIs para el dashboard.
   * @returns {Promise<DashboardResumenDTO>} Ventas, top de productos y margen del período.
   */
  async obtenerResumen(): Promise<DashboardResumenDTO> {
    const ahora = new Date();
    const inicioHoy = this.inicioDelDia(ahora);
    const inicioSemana = this.inicioDeLaSemana(ahora);
    const inicioMes = this.inicioDelMes(ahora);

    const [ventasHoy, ventasSemana, ventasMes, detallesMes] = await Promise.all([
      this.dao.obtenerVentasEnRango(inicioHoy, ahora),
      this.dao.obtenerVentasEnRango(inicioSemana, ahora),
      this.dao.obtenerVentasEnRango(inicioMes, ahora),
      this.dao.obtenerDetallesEnRango(inicioMes, ahora),
    ]);

    const lineas: LineaVenta[] = detallesMes
      .filter((d) => d.sales?.sold_at && d.product_variants)
      .map((d) => ({
        soldAt: d.sales!.sold_at as Date,
        quantity: d.quantity ?? 0,
        unitPrice: d.unitPrice ?? 0,
        unitCost: d.unitCost ?? 0,
        nombreProducto: d.product_variants!.products?.name || "",
        sku: d.product_variants!.SKU,
      }));

    return {
      ventas: {
        hoy: ventasHoy,
        semana: ventasSemana,
        mes: ventasMes,
      },
      topProductos: this.calcularTopProductos(lineas),
      margen: {
        hoy: this.calcularMargen(lineas.filter((l) => l.soldAt >= inicioHoy)),
        semana: this.calcularMargen(lineas.filter((l) => l.soldAt >= inicioSemana)),
        mes: this.calcularMargen(lineas),
      },
    };
  }

  /** Inicio del día (00:00) para la fecha dada. */
  private inicioDelDia(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  }

  /** Inicio de la semana (lunes 00:00) para la fecha dada. */
  private inicioDeLaSemana(fecha: Date): Date {
    const inicioHoy = this.inicioDelDia(fecha);
    const diaSemana = inicioHoy.getDay(); // 0 = domingo, 1 = lunes, ...
    const diasDesdeElLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    inicioHoy.setDate(inicioHoy.getDate() - diasDesdeElLunes);
    return inicioHoy;
  }

  /** Inicio del mes (día 1, 00:00) para la fecha dada. */
  private inicioDelMes(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  }

  /** Agrega las líneas de venta por producto y arma el top de más vendidos. */
  private calcularTopProductos(lineas: LineaVenta[]): TopProductoDTO[] {
    const porSku = new Map<string, TopProductoDTO>();
    for (const linea of lineas) {
      const acumulado = porSku.get(linea.sku) ?? {
        nombre: linea.nombreProducto,
        sku: linea.sku,
        unidadesVendidas: 0,
        ingresos: 0,
      };
      acumulado.unidadesVendidas += linea.quantity;
      acumulado.ingresos += linea.quantity * linea.unitPrice;
      porSku.set(linea.sku, acumulado);
    }
    return Array.from(porSku.values())
      .sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)
      .slice(0, LIMITE_TOP_PRODUCTOS);
  }

  /** Calcula el margen de ganancia agregado de un conjunto de líneas de venta. */
  private calcularMargen(lineas: LineaVenta[]): MargenPeriodoDTO {
    let ingresos = 0;
    let montoMargen = 0;
    for (const linea of lineas) {
      ingresos += linea.quantity * linea.unitPrice;
      montoMargen += linea.quantity * (linea.unitPrice - linea.unitCost);
    }
    return {
      montoMargen: Math.round(montoMargen * 100) / 100,
      porcentajeMargen: ingresos > 0 ? Math.round((montoMargen / ingresos) * 10000) / 100 : 0,
    };
  }
}
