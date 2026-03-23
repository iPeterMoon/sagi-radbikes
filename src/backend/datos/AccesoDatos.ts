import { IAccesoDatos } from "./IAccesoDatos";
import { PrismaClient } from "@prisma/client";
import { PrismaFactory } from "./PrismaFactory";
import { ProductDAO } from "./daos/implementaciones/ProductDAO";
import { IProductDAO } from "./daos/interfaces/IProductDAO";
import { ILabelDAO } from "./daos/interfaces/ILabelDAO";
import { LabelDAO } from "./daos/implementaciones/LabelDAO";
import { CategoryDAO } from "./daos/implementaciones/CategoryDAO";
import { ICategoryDAO } from "./daos/interfaces/ICategoryDAO";
import { SubCategoryDAO } from "./daos/implementaciones/SubCategoryDAO";
import { ISubCategoryDAO } from "./daos/interfaces/ISubCategoryDAO";

export class AccesoDatos implements IAccesoDatos {
  public readonly prisma: PrismaClient;
  public readonly productDAO: IProductDAO;
  public readonly labelDAO: ILabelDAO;
  public readonly categoryDAO: ICategoryDAO;
  public readonly subCategoryDAO: ISubCategoryDAO;

  constructor() {
    this.prisma = PrismaFactory.getCliente();
    this.productDAO = new ProductDAO(this.prisma);
    this.labelDAO = new LabelDAO(this.prisma);
    this.categoryDAO = new CategoryDAO(this.prisma);
    this.subCategoryDAO = new SubCategoryDAO(this.prisma);
  }
}
