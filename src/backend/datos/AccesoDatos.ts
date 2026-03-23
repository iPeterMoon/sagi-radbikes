import { IAccesoDatos } from "./IAccesoDatos";
import { PrismaClient } from "@prisma/client";
import { PrismaFactory } from "./PrismaFactory";
import { ProductDAO } from "./daos/implementaciones/ProductDAO";
import { IProductDAO } from "./daos/interfaces/IProductDAO";
import { ILabelDAO } from "./daos/interfaces/ILabelDAO";
import { LabelDAO } from "./daos/implementaciones/LabelDAO";

export class AccesoDatos implements IAccesoDatos {
  public readonly prisma: PrismaClient;
  public readonly productDAO: IProductDAO;
  public readonly labelDAO: ILabelDAO;

  constructor() {
    this.prisma = PrismaFactory.getCliente();
    this.productDAO = new ProductDAO(this.prisma);
    this.labelDAO = new LabelDAO(this.prisma);
  }
}
