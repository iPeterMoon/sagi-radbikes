import { product_images } from "@prisma/client";

export interface IProductImageDAO {
  create(img: File, productId: bigint): Promise<product_images>;
  getById(id: bigint): Promise<product_images | null>;
  delete(id: bigint): Promise<product_images>;
  getByProduct(productId: bigint): Promise<product_images[]>;
  getMainByProduct(productId: bigint): Promise<product_images | null>;
  setMain(id: bigint): Promise<boolean>;
  deleteByProduct(productId: bigint): Promise<boolean>;
}