import { product_physical } from "@prisma/client";

export interface ILabelDAO {
  getByProduct(productId: bigint): Promise<product_physical[]>;
  deleteByProduct(productId: bigint): Promise<boolean>;
}
