import { PrismaClient, product_physical } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { ILabelDAO } from "../interfaces/ILabelDAO";

export class LabelDAO
  extends GenericDAO<product_physical>
  implements ILabelDAO
{
  constructor(prisma: PrismaClient) {
    super(prisma, "product_physical");
  }

  async getByProduct(productId: bigint): Promise<product_physical[]> {
    return await this.db.findMany({
      where: { product_id: productId },
    });
  }

  async deleteByProduct(productId: bigint): Promise<boolean> {
    try {
      await this.db.deleteMany({
        where: { product_id: productId },
      });
      return true;
    } catch {
      return false;
    }
  }
}
