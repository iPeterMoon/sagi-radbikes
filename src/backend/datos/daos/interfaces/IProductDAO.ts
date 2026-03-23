import { products } from "@prisma/client";

export interface IProductDAO {
  getBelowStock(threshold: number): Promise<products[]>;
  getByCategory(categoryId: bigint): Promise<products[]>;
  getBySubCategory(subCategoryId: bigint): Promise<products[]>;
  getByBrand(brandId: bigint): Promise<products[]>;
  getActive(): Promise<products[]>;
  getBySKU(sku: string): Promise<products | null>;
  getByFilter(
    search: string,
    categoryId: bigint | null,
    brandId: bigint | null,
    minPrice: number | null,
    maxPrice: number | null,
  ): Promise<products[]>;
  getByBarcode(barcode: string): Promise<products | null>;
  decreaseStock(id: bigint, quantity: number): Promise<boolean>;
}
