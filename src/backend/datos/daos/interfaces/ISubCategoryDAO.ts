import { subcategory } from "@prisma/client";

export interface ISubCategoryDAO {
  getByCategory(categoryId: bigint): Promise<subcategory[]>;
  getByName(name: string): Promise<subcategory | null>;
}