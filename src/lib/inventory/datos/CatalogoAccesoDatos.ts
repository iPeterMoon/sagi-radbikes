import { PrismaClient } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { PrismaFactory } from "@/lib/PrismaFactory";
import { SupabaseFactory } from "../../SupabaseFactory";
import { ProductDAO } from "./daos/implementaciones/ProductDAO";
import { CategoryDAO } from "./daos/implementaciones/CategoryDAO";
import { BrandDAO } from "./daos/implementaciones/BrandDAO";
import { SubCategoryDAO } from "./daos/implementaciones/SubCategoryDAO";
import { ProductImageDAO } from "./daos/implementaciones/ProductImageDAO";
import { LabelDAO } from "./daos/implementaciones/LabelDAO";
import { ProductVariantDAO } from "./daos/implementaciones/ProductVariantDAO";
import { VariantAttributeDAO } from "./daos/implementaciones/VariantAttributeDAO";
import { IProductDAO } from "./daos/interfaces/IProductDAO";
import { ICategoryDAO } from "./daos/interfaces/ICategoryDAO";
import { IBrandDAO } from "./daos/interfaces/IBrandDAO";
import { ISubCategoryDAO } from "./daos/interfaces/ISubCategoryDAO";
import { IProductImageDAO } from "./daos/interfaces/IProductImageDAO";
import { ILabelDAO } from "./daos/interfaces/ILabelDAO";
import { IProductVariantDAO } from "./daos/interfaces/IProductVariantDAO";
import { IVariantAttributeDAO } from "./daos/interfaces/IVariantAttributeDAO";
import { ICatalogoAccesoDatos } from "./daos/interfaces/ICatalogoAccesoDatos";

/**
 * Implementación concreta de la interfaz ICatalogoAccesoDatos.
 * Esta clase centraliza el acceso a la base de datos y almacenamiento,
 * y proporciona instancias de todos los DAOs necesarios para gestionar
 * el catálogo de productos, categorías, marcas, subcategorías, imágenes,
 * etiquetas, variantes y sus atributos.
 */
export class CatalogoAccesoDatos implements ICatalogoAccesoDatos {
  public readonly prisma: PrismaClient;
  public readonly supabase: SupabaseClient;
  public readonly productDAO: IProductDAO;
  public readonly categoryDAO: ICategoryDAO;
  public readonly brandDAO: IBrandDAO;
  public readonly subCategoryDAO: ISubCategoryDAO;
  public readonly productImageDAO: IProductImageDAO;
  public readonly labelDAO: ILabelDAO;
  public readonly variantDAO: IProductVariantDAO;
  public readonly variantAttributeDAO: IVariantAttributeDAO;

  /**
   * Constructor de la clase CatalogoAccesoDatos.
   * Inicializa el cliente de Prisma, el cliente de Supabase y todas las instancias de los DAOs.
   */
  constructor() {
    this.prisma = PrismaFactory.getCliente();
    this.supabase = SupabaseFactory.getCliente();
    this.productDAO = new ProductDAO(this.prisma);
    this.categoryDAO = new CategoryDAO(this.prisma);
    this.brandDAO = new BrandDAO(this.prisma);
    this.subCategoryDAO = new SubCategoryDAO(this.prisma);
    this.productImageDAO = new ProductImageDAO(this.prisma, this.supabase);
    this.labelDAO = new LabelDAO(this.prisma);
    this.variantDAO = new ProductVariantDAO(this.prisma);
    this.variantAttributeDAO = new VariantAttributeDAO(this.prisma);
  }
}
