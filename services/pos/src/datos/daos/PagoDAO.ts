import { PrismaClient, payments } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";

export class PagoDAO extends GenericDAO<payments> {
  constructor(prisma: PrismaClient) {
    super(prisma, "payments");
  }

  async getByVenta(idVenta: bigint): Promise<payments[]> {
    return await this.db.findMany({ where: { sale_id: idVenta } });
  }

  async createPago(data: {
    sale_id: bigint;
    paymentMethod: string;
    amount: number;
  }): Promise<payments> {
    return await this.db.create({ data });
  }
}
