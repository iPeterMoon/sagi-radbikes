import { PrismaClient } from "@prisma/client";
import { UsuarioDAO } from "./daos/implementaciones/UsuarioDAO";
import { UsuarioRolDAO } from "./daos/implementaciones/UsuarioRolDAO";
import { RolDAO } from "./daos/implementaciones/RolDAO";

/**
 * Interfaz para acceso a datos de autenticación.
 * Define los DAOs disponibles para operaciones de usuario y roles.
 */
export interface IAuthAccesoDatos {
  readonly prisma: PrismaClient;
  readonly usuarioDAO: UsuarioDAO;
  readonly usuarioRolDAO: UsuarioRolDAO;
  readonly rolDAO: RolDAO;
}
