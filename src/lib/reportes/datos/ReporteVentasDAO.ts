import { PrismaClient, sales, sale_details, product_variants, products, payments, users } from "@prisma/client";

/** Fila de `sales` con todas las relaciones necesarias para armar el reporte de ventas. */
export type VentaConDetalle = sales & {
  users: users | null;
  payments: payments[];
  sale_details: (sale_details & {
    product_variants: (product_variants & { products: products }) | null;
  })[];
};

/**
 * Data Access Object para las consultas de ventas del módulo de Reportes.
 */
export class ReporteVentasDAO {
  constructor(private prisma: PrismaClient) {}

  /**
   * Obtiene todas las ventas realizadas en un rango de fechas, con su vendedor,
   * pagos y partidas (con variante y producto), en una sola consulta.
   * @param desde - Fecha de inicio (inclusive).
   * @param hasta - Fecha de fin (exclusive).
   * @returns Ventas del rango, ordenadas cronológicamente.
   */
  async obtenerVentasEnRango(desde: Date, hasta: Date): Promise<VentaConDetalle[]> {
    return await this.prisma.sales.findMany({
      where: { sold_at: { gte: desde, lt: hasta } },
      include: {
        users: true,
        payments: true,
        sale_details: { include: { product_variants: { include: { products: true } } } },
      },
      orderBy: { sold_at: "asc" },
    });
  }
}
