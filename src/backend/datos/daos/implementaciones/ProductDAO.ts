import { PrismaClient, products } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IProductDAO } from "../interfaces/IProductDAO";

export class ProductDAO extends GenericDAO<products> implements IProductDAO {
  constructor(prisma: PrismaClient) {
    super(prisma, "products");
  }

  async getBelowStock(threshold: number): Promise<products[]> {
    return await this.db.findMany({
      where: { stock: { lt: threshold } },
    });
  }

  async getByCategory(categoryId: bigint): Promise<products[]> {
    return await this.db.findMany({
      where: { subcategory: { category_id: categoryId } },
    });
  }

  async getBySubCategory(subCategoryId: bigint): Promise<products[]> {
    return await this.db.findMany({
      where: { subcategory_id: subCategoryId },
    });
  }

  async getByBrand(brandId: bigint): Promise<products[]> {
    return await this.db.findMany({
      where: { brand_id: brandId },
    });
  }

  async getActive(): Promise<products[]> {
    return await this.db.findMany({
      where: { is_active: true },
    });
  }

  async getBySKU(sku: string): Promise<products | null> {
    return await this.db.findUnique({
      where: { SKU: sku },
    });
  }

  async getByFilter(
    search: string,
    categoryId: bigint | null,
    brandId: bigint | null,
    minPrice: number | null,
    maxPrice: number | null,
  ): Promise<products[]> {
    return await this.db.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { description: { contains: search, mode: "insensitive" } },
                  { SKU: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          categoryId !== null
            ? { subcategory: { category_id: categoryId } }
            : {},
          brandId !== null ? { brand_id: brandId } : {},
          minPrice !== null ? { price: { gte: minPrice } } : {},
          maxPrice !== null ? { price: { lte: maxPrice } } : {},
        ],
      },
    });
  }

  async getByBarcode(barcode: string): Promise<products | null> {
    return await this.db.findFirst({
      where: { barcode_upc: barcode },
    });
  }

  async decreaseStock(id: bigint, quantity: number): Promise<boolean> {
    try {
      const product = await this.db.findUnique({ where: { id } });
      if (!product || product.stock === null || product.stock < quantity) {
        return false;
      }
      await this.db.update({
        where: { id },
        data: { stock: { decrement: quantity } },
      });
      return true;
    } catch {
      return false;
    }
  }
}
