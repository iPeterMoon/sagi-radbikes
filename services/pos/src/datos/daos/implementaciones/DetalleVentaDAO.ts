import { PrismaClient, sale_details } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IDetalleVentaDAO } from "../interfaces/IDetalleVentaDAO";

export class DetalleVentaDAO extends GenericDAO<sale_details> implements IDetalleVentaDAO {
  constructor(prisma: PrismaClient) {
    super(prisma, "sale_details");
  }

  async getByVenta(idVenta: bigint): Promise<sale_details[]> {
    return await this.db.findMany({
      where: { sale_id: idVenta },
      include: { products: true },
    });
  }

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
