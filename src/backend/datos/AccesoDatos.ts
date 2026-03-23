import { IAccesoDatos } from "./IAccesoDatos";
import { PrismaClient } from "@prisma/client";
import { PrismaFactory } from "./PrismaFactory";
import { ProductDAO } from "./daos/implementaciones/ProductDAO";
import { IProductDAO } from "./daos/interfaces/IProductDAO";

export class AccesoDatos implements IAccesoDatos {
  public readonly prisma: PrismaClient;
  public readonly productDAO: IProductDAO;

  constructor() {
    this.prisma = PrismaFactory.getCliente();
    this.productDAO = new ProductDAO(this.prisma);
  }
}
