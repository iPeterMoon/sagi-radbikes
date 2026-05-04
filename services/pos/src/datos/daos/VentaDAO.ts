import { PrismaClient, sales } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";

export class VentaDAO extends GenericDAO<sales> {
  constructor(prisma: PrismaClient) {
    super(prisma, "sales");
  }

  async getByUsuario(idUsuario: bigint): Promise<sales[]> {
    return await this.db.findMany({
      where: { user_seller: idUsuario },
      include: { sale_details: true, payments: true },
      orderBy: { created_at: "desc" },
    });
  }

  async getByFolio(folio: string): Promise<sales | null> {
    return await this.db.findFirst({
      where: { folio },
      include: { sale_details: true, payments: true },
    });
  }

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
