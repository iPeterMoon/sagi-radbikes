import { PrismaClient, roles } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IRolDAO } from "../interfaces/IRolDAO";

export class RolDAO extends GenericDAO<roles> implements IRolDAO {
  constructor(prisma: PrismaClient) {
    super(prisma, "roles");
  }

  async getByName(name: string): Promise<roles | null> {
    return await this.db.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  }
}