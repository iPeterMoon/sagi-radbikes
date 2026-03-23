import { subcategory } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

export interface ISubCategoryDAO extends IGenericDAO<subcategory> {
  getByCategory(categoryId: bigint): Promise<subcategory[]>;
  getByName(name: string): Promise<subcategory | null>;
}
