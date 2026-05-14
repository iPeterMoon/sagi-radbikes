import { PrismaClient } from "@prisma/client";
import { PrismaFactory } from "./PrismaFactory";
import { UsuarioDAO } from "./daos/implementaciones/UsuarioDAO";
import { UsuarioRolDAO } from "./daos/implementaciones/UsuarioRolDAO";
import { IAuthAccesoDatos } from "./IAuthAccesoDatos";

/**
 * Implementación concreta de la interfaz IAuthAccesoDatos. Esta clase centraliza el acceso a la base de datos
 * y proporciona instancias de los DAOs necesarios para gestionar la autenticación, como usuarios y roles.
 */
export class AuthAccesoDatos implements IAuthAccesoDatos {
  public readonly prisma: PrismaClient;
  public readonly usuarioDAO: UsuarioDAO;
  public readonly usuarioRolDAO: UsuarioRolDAO;

  /**
   * Constructor de la clase AuthAccesoDatos. Inicializa el cliente de Prisma y todas las instancias de los DAOs
   * necesarios para gestionar la autenticación, como usuarios y roles.
   */
  constructor() {
    this.prisma = PrismaFactory.getCliente();
    this.usuarioDAO = new UsuarioDAO(this.prisma);
    this.usuarioRolDAO = new UsuarioRolDAO(this.prisma);
  }
}