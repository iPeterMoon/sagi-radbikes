import { PrismaClient } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { PrismaFactory } from "./PrismaFactory";
import { SupabaseFactory } from "./SupabaseFactory";
import { ProductDAO } from "./daos/implementaciones/ProductDAO";
import { CategoryDAO } from "./daos/implementaciones/CategoryDAO";
import { BrandDAO } from "./daos/implementaciones/BrandDAO";
import { SubCategoryDAO } from "./daos/implementaciones/SubCategoryDAO";
import { ProductImageDAO } from "./daos/implementaciones/ProductImageDAO";
import { LabelDAO } from "./daos/implementaciones/LabelDAO";

export class CatalogoAccesoDatos {
  public readonly prisma: PrismaClient;
  public readonly supabase: SupabaseClient;
  public readonly productDAO: ProductDAO;
  public readonly categoryDAO: CategoryDAO;
  public readonly brandDAO: BrandDAO;
  public readonly subCategoryDAO: SubCategoryDAO;
  public readonly productImageDAO: ProductImageDAO;
  public readonly labelDAO: LabelDAO;

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