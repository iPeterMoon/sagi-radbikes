import { PrismaClient, sales } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IVentaDAO } from "../interfaces/IVentaDAO";

/**
 * Data Access Object principal para gestionar la entidad de Ventas.
 */
export class VentaDAO extends GenericDAO<sales> implements IVentaDAO {
  constructor(prisma: PrismaClient) {
    super(prisma, "sales");
  }

  /**
   * Recupera el historial de ventas realizadas por un usuario específico (vendedor),
   * ordenadas de la más reciente a la más antigua.
   * @param {bigint} idUsuario - Identificador del usuario vendedor.
   * @returns {Promise<sales[]>} Historial de ventas.
   */
  async getByUsuario(idUsuario: bigint): Promise<sales[]> {
    return await this.db.findMany({
      where: { user_seller: idUsuario },
      include: { sale_details: true, payments: true },
      orderBy: { created_at: "desc" },
    });
  }

  /**
   * Busca una venta utilizando el folio único generado al momento de la transacción.
   * Incluyendo la información del producto (nombre) necesaria para reconstruir el ticket
   * @param {string} folio - Cadena de folio de venta.
   * @returns {Promise<sales | null>} Entidad completa de venta o nulo.
   */
  async getByFolio(folio: string): Promise<sales | null> {
    return await this.db.findFirst({
      where: { folio },
      include: {
        sale_details: { include: { product_variants: { include: { products: true, product_variant_attributes: true } } } },
        payments: true
      },
    });
  }

  /**
   * Crea un nuevo encabezado de venta (registro principal).
   * @param {Object} data - Estructura con datos de importes, folio e impuestos.
   * @returns {Promise<sales>} La nueva venta registrada.
   */
  async createWithDetails(data: {
    user_seller: bigint;
    folio: string;
    total: number;
    subtotal: number;
    IVA_amount: number;
    tax_percentage: number;
  }): Promise<sales> {
    return await this.db.create({ data });
  }
}
