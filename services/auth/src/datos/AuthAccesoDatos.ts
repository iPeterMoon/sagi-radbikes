import { PrismaClient } from "@prisma/client";
import { PrismaFactory } from "./PrismaFactory";
import { UsuarioDAO } from "./daos/implementaciones/UsuarioDAO";
import { UsuarioRolDAO } from "./daos/implementaciones/UsuarioRolDAO";

export class AuthAccesoDatos {
  public readonly prisma: PrismaClient;
  public readonly usuarioDAO: UsuarioDAO;
  public readonly usuarioRolDAO: UsuarioRolDAO;

  constructor() {
    this.prisma = PrismaFactory.getCliente();
    this.usuarioDAO = new UsuarioDAO(this.prisma);
    this.usuarioRolDAO = new UsuarioRolDAO(this.prisma);
  }
}