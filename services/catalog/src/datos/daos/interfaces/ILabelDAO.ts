import { product_physical } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

export interface ILabelDAO extends IGenericDAO<product_physical> {
  getByProduct(productId: bigint): Promise<product_physical[]>;
  deleteByProduct(productId: bigint): Promise<boolean>;
}
