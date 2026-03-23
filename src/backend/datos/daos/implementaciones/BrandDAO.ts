import { PrismaClient, brands } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IBrandDAO } from "../interfaces/IBrandDAO";

export class BrandDAO extends GenericDAO<brands> implements IBrandDAO {
  constructor(prisma: PrismaClient) {
    super(prisma, "brands");
  }

  async getByName(name: string): Promise<brands | null> {
    return await this.db.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  }
}
