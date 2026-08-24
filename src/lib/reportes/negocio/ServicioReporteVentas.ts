import { ReporteVentasDAO, VentaConDetalle } from "../datos/ReporteVentasDAO";
import { FiltroReporteVentasDTO } from "./DTOsEntrada/FiltroReporteVentasDTO";
import {
  ReporteVentasDTO,
  ResumenReporteVentasDTO,
  TopProductoReporteDTO,
  VentaPorDiaDTO,
  VentaDetalleDTO,
} from "./DTOsSalida/ReporteVentasDTO";

/** Cantidad máxima de días permitida en un rango de reporte, para evitar traer años de datos por accidente. */
const RANGO_MAXIMO_DIAS = 366;
/** Cantidad de productos a incluir en el ranking de más vendidos. */
const LIMITE_TOP_PRODUCTOS = 10;

/**
 * Orquesta la generación del reporte de ventas para un rango de fechas
 * arbitrario elegido por el usuario: resumen de KPIs, productos más
 * vendidos, desglose por día y listado detallado de ventas.
 */
export class ServicioReporteVentas {
  constructor(private dao: ReporteVentasDAO) {}

  async generarReporte(filtro: FiltroReporteVentasDTO): Promise<ReporteVentasDTO> {
    const { desde, hasta } = this.validarYParsearRango(filtro);
    const ventas = await this.dao.obtenerVentasEnRango(desde, hasta);

    return {
      desde: filtro.desde,
      hasta: filtro.hasta,
      resumen: this.calcularResumen(ventas),
      topProductos: this.calcularTopProductos(ventas),
      ventasPorDia: this.calcularVentasPorDia(ventas),
      ventas: this.mapearVentas(ventas),
    };
  }

  /**
   * Valida el filtro recibido y lo convierte a un rango `[desde, hasta)` de
   * `Date` listo para consultar: `hasta` pasa a ser el día siguiente al
   * seleccionado, para que el filtro `lt` incluya el día "hasta" completo.
   */
  private validarYParsearRango(filtro: FiltroReporteVentasDTO): { desde: Date; hasta: Date } {
    if (!filtro.desde || !filtro.hasta) {
      throw new Error("Debés indicar una fecha de inicio y una fecha de fin");
    }

    const desde = new Date(`${filtro.desde}T00:00:00`);
    const finDelDia = new Date(`${filtro.hasta}T00:00:00`);

    if (Number.isNaN(desde.getTime()) || Number.isNaN(finDelDia.getTime())) {
      throw new Error("Las fechas ingresadas no son válidas");
    }
    if (desde > finDelDia) {
      throw new Error("La fecha de inicio no puede ser posterior a la fecha de fin");
    }

    const hasta = new Date(finDelDia);
    hasta.setDate(hasta.getDate() + 1);

    const rangoEnDias = (hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24);
    if (rangoEnDias > RANGO_MAXIMO_DIAS) {
      throw new Error("El rango de fechas no puede ser mayor a 1 año");
    }

    return { desde, hasta };
  }

  private calcularResumen(ventas: VentaConDetalle[]): ResumenReporteVentasDTO {
    let total = 0;
    let ingresos = 0;
    let montoMargen = 0;

    for (const venta of ventas) {
      total += venta.total ?? 0;
      for (const detalle of venta.sale_details) {
        const cantidad = detalle.quantity ?? 0;
        const precio = detalle.unitPrice ?? 0;
        const costo = detalle.unitCost ?? 0;
        ingresos += cantidad * precio;
        montoMargen += cantidad * (precio - costo);
      }
    }

    return {
      total: Math.round(total * 100) / 100,
      cantidadVentas: ventas.length,
      montoMargen: Math.round(montoMargen * 100) / 100,
      porcentajeMargen: ingresos > 0 ? Math.round((montoMargen / ingresos) * 10000) / 100 : 0,
    };
  }

  private calcularTopProductos(ventas: VentaConDetalle[]): TopProductoReporteDTO[] {
    const porSku = new Map<string, TopProductoReporteDTO>();

    for (const venta of ventas) {
      for (const detalle of venta.sale_details) {
        const variante = detalle.product_variants;
        if (!variante) continue;

        const acumulado = porSku.get(variante.SKU) ?? {
          nombre: variante.products?.name || "",
          sku: variante.SKU,
          unidadesVendidas: 0,
          ingresos: 0,
        };
        const cantidad = detalle.quantity ?? 0;
        acumulado.unidadesVendidas += cantidad;
        acumulado.ingresos += cantidad * (detalle.unitPrice ?? 0);
        porSku.set(variante.SKU, acumulado);
      }
    }

    return Array.from(porSku.values())
      .sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)
      .slice(0, LIMITE_TOP_PRODUCTOS);
  }

  private calcularVentasPorDia(ventas: VentaConDetalle[]): VentaPorDiaDTO[] {
    const porDia = new Map<string, VentaPorDiaDTO>();

    for (const venta of ventas) {
      if (!venta.sold_at) continue;
      const fecha = this.formatearFecha(venta.sold_at);
      const acumulado = porDia.get(fecha) ?? { fecha, total: 0, cantidadVentas: 0 };
      acumulado.total += venta.total ?? 0;
      acumulado.cantidadVentas += 1;
      porDia.set(fecha, acumulado);
    }

    return Array.from(porDia.values())
      .map((dia) => ({ ...dia, total: Math.round(dia.total * 100) / 100 }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  private mapearVentas(ventas: VentaConDetalle[]): VentaDetalleDTO[] {
    return ventas.map((venta) => ({
      folio: venta.folio || "—",
      fecha: (venta.sold_at ?? venta.created_at).toISOString(),
      vendedor: this.nombreVendedor(venta.users),
      metodoPago: venta.payments[0]?.paymentMethod || "—",
      total: venta.total ?? 0,
    }));
  }

  private nombreVendedor(usuario: VentaConDetalle["users"]): string {
    if (!usuario) return "—";
    const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(" ");
    return nombreCompleto || usuario.username || "—";
  }

  private formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
