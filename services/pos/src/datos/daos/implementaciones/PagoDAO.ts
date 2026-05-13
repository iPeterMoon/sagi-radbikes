import { PrismaClient, payments } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IPagoDAO } from "../interfaces/IPagoDAO";

/**
 * Data Access Object para el manejo de los Pagos.
 */
export class PagoDAO extends GenericDAO<payments> implements IPagoDAO {
  constructor(prisma: PrismaClient) {
    super(prisma, "payments");
  }

  /**
   * Obtiene los pagos registrados asociados a una transacción de venta.
   * @param {bigint} idVenta - Identificador de la venta.
   * @returns {Promise<payments[]>} Lista de pagos correspondientes a esa venta.
   */
  async getByVenta(idVenta: bigint): Promise<payments[]> {
    return await this.db.findMany({ where: { sale_id: idVenta } });
  }

  /**
   * Registra un nuevo pago en el sistema.
   * @param {Object} data - Datos necesarios para asentar el pago.
   * @returns {Promise<payments>} Entidad de pago persistida.
   */
  async createPago(data: {
    sale_id: bigint;
    paymentMethod: string;
    amount: number;
  }): Promise<payments> {
    return await this.db.create({ data });
  }
}
