import { user_role } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

export interface IUsuarioRolDAO extends IGenericDAO<user_role> {
  getByUserId(userId: bigint): Promise<user_role[]>;
}