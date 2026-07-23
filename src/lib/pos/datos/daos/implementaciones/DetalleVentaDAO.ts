import { PrismaClient, sale_details } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IDetalleVentaDAO } from "../interfaces/IDetalleVentaDAO";

/**
 * Data Access Object para la tabla de Detalles de Venta.
 */
export class DetalleVentaDAO extends GenericDAO<sale_details> implements IDetalleVentaDAO {
  constructor(prisma: PrismaClient) {
    super(prisma, "sale_details");
  }

  /**
   * Obtiene todos los detalles o partidas asociados a una venta específica.
   * @param {bigint} idVenta - El identificador de la venta principal.
   * @returns {Promise<sale_details[]>} Lista de detalles de venta.
   */
  async getByVenta(idVenta: bigint): Promise<sale_details[]> {
    return await this.db.findMany({
      where: { sale_id: idVenta },
      include: { products: true },
    });
  }

  /**
   * Inserta múltiples detalles de venta de forma masiva (Bulk Insert).
   * @param {Array<Object>} detalles - Lista de registros a insertar.
   * @returns {Promise<void>}
   */
  async createMany(
    detalles: Array<{
      sale_id: bigint;
      product_id: bigint;
      quantity: number;
      unitPrice: number;
    }>,
  ): Promise<void> {
    await this.prisma.sale_details.createMany({ data: detalles });
  }
}
