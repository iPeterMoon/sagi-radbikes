import { IAccesoDatos } from "./IAccesoDatos";

import { PrismaClient } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

import { PrismaFactory } from "./PrismaFactory";
import { SupabaseFactory } from "./SupabaseFactory";

import { IProductDAO } from "./daos/interfaces/IProductDAO";
import { ICategoryDAO } from "./daos/interfaces/ICategoryDAO";
import { IBrandDAO } from "./daos/interfaces/IBrandDAO";
import { ISubCategoryDAO } from "./daos/interfaces/ISubCategoryDAO";
import { IProductImageDAO } from "./daos/interfaces/IProductImageDAO";
import { ILabelDAO } from "./daos/interfaces/ILabelDAO";

import { ProductDAO } from "./daos/implementaciones/ProductDAO";
import { CategoryDAO } from "./daos/implementaciones/CategoryDAO";
import { BrandDAO } from "./daos/implementaciones/BrandDAO";
import { SubCategoryDAO } from "./daos/implementaciones/SubCategoryDAO";
import { ProductImageDAO } from "./daos/implementaciones/ProductImageDAO";
import { LabelDAO } from "./daos/implementaciones/LabelDAO";

export class AccesoDatos {
  private readonly prisma: PrismaClient;
  private readonly supabase: SupabaseClient;

  public readonly productDAO: IProductDAO;
  public readonly categoryDAO: ICategoryDAO;
  public readonly brandDAO: IBrandDAO;
  public readonly subCategoryDAO: ISubCategoryDAO;
  public readonly productImageDAO: IProductImageDAO;
  public readonly labelDAO: ILabelDAO;

  constructor() {
    this.prisma = PrismaFactory.getCliente();
    this.supabase = SupabaseFactory.getCliente();

    this.productDAO = new ProductDAO(this.prisma);
    this.categoryDAO = new CategoryDAO(this.prisma);
    this.brandDAO = new BrandDAO(this.prisma);
    this.subCategoryDAO = new SubCategoryDAO(this.prisma);
    this.productImageDAO = new ProductImageDAO(this.prisma, this.supabase);
    this.labelDAO = new LabelDAO(this.prisma);
  }
}
