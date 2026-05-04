import { PrismaClient, users } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IUsuarioDAO } from "../interfaces/IUsuarioDAO";

export class UsuarioDAO extends GenericDAO<users> implements IUsuarioDAO {
  constructor(prisma: PrismaClient) {
    super(prisma, "users");
  }

  async getByUsername(username: string): Promise<users | null> {
    return await this.db.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
    });
  }

  async getByUsernameWithRoles(
    username: string
  ): Promise<(users & { user_role: Array<{ roles: any }> }) | null> {
    return await this.db.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
      include: {
        user_role: {
          include: {
            roles: true,
          },
        },
      },
    });
  }
}