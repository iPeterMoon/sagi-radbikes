import { PrismaClient, subcategory } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { ISubCategoryDAO } from "../interfaces/ISubCategoryDAO";

export class SubCategoryDAO
  extends GenericDAO<subcategory>
  implements ISubCategoryDAO
{
  constructor(prisma: PrismaClient) {
    super(prisma, "subcategory");
  }

  async getByCategory(categoryId: bigint): Promise<subcategory[]> {
    return await this.db.findMany({
      where: { category_id: categoryId },
    });
  }

  async getByName(name: string): Promise<subcategory | null> {
    return await this.db.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  }
}
