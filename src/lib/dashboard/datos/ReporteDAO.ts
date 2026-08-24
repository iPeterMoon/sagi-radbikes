import { PrismaClient, sale_details, product_variants, products, sales } from "@prisma/client";

type DetalleConVariante = sale_details & {
  product_variants: (product_variants & { products: products }) | null;
  sales: sales | null;
};

/**
 * Data Access Object para las consultas de agregación usadas en el dashboard de KPIs.
 */
export class ReporteDAO {
  constructor(private prisma: PrismaClient) {}

  /**
   * Obtiene el total vendido y la cantidad de ventas registradas en un rango de fechas.
   * @param {Date} desde - Fecha de inicio (inclusive).
   * @param {Date} hasta - Fecha de fin (exclusive).
   * @returns {Promise<{ total: number; cantidadVentas: number }>} Totales del rango.
   */
  async obtenerVentasEnRango(
    desde: Date,
    hasta: Date,
  ): Promise<{ total: number; cantidadVentas: number }> {
    const resultado = await this.prisma.sales.aggregate({
      where: { sold_at: { gte: desde, lt: hasta } },
      _sum: { total: true },
      _count: true,
    });
    return {
      total: resultado._sum.total ?? 0,
      cantidadVentas: resultado._count,
    };
  }

  /**
   * Obtiene las partidas de venta (con variante y producto) vendidas en un rango de fechas.
   * Se usa para calcular top de productos y margen, ya que esos cálculos requieren
   * multiplicar campos por fila (quantity × unitPrice / unitCost), algo que Prisma
   * no puede agregar directamente con `groupBy`.
   * @param {Date} desde - Fecha de inicio (inclusive).
   * @param {Date} hasta - Fecha de fin (exclusive).
   * @returns {Promise<DetalleConVariante[]>} Detalles de venta del rango.
   */
  async obtenerDetallesEnRango(desde: Date, hasta: Date): Promise<DetalleConVariante[]> {
    return await this.prisma.sale_details.findMany({
      where: { sales: { sold_at: { gte: desde, lt: hasta } } },
      include: { product_variants: { include: { products: true } }, sales: true },
    });
  }
}
