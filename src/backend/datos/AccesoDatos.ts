import { IAccesoDatos } from "./IAccesoDatos";
import { PrismaClient } from "@prisma/client";
import { PrismaFactory } from "./PrismaFactory";

export class AccesoDatos implements IAccesoDatos {
  public readonly prisma: PrismaClient;

  constructor() {
    this.prisma = PrismaFactory.getCliente();
  }
}
