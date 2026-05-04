import { PrismaClient, categories } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { ICategoryDAO } from "../interfaces/ICategoryDAO";

export class CategoryDAO
  extends GenericDAO<categories>
  implements ICategoryDAO
{
  constructor(prisma: PrismaClient) {
    super(prisma, "categories");
  }

  async getByName(name: string): Promise<categories | null> {
    return await this.db.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  }
}