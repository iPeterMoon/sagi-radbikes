import { PrismaClient, user_role } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IUsuarioRolDAO } from "../interfaces/IUsuarioRolDAO";

export class UsuarioRolDAO extends GenericDAO<user_role>
  implements IUsuarioRolDAO
{
  constructor(prisma: PrismaClient) {
    super(prisma, "user_role");
  }

  async getByUserId(userId: bigint): Promise<user_role[]> {
    return await this.db.findMany({
      where: { user_id: userId },
      include: {
        roles: true,
      },
    });
  }
}