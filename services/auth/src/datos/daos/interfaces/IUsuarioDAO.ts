import { users } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

export interface IUsuarioDAO extends IGenericDAO<users> {
  getByUsername(username: string): Promise<users | null>;
  getByUsernameWithRoles(username: string): Promise<
    (users & { user_role: Array<{ roles: any }> }) | null
  >;
}