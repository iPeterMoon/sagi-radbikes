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
import { IUsuarioDAO } from "./daos/interfaces/IUsuarioDAO";
import { IUsuarioRolDAO } from "./daos/interfaces/IUsuarioRolDAO";
import { IRolDAO } from "./daos/interfaces/IRolDAO";

import { ProductDAO } from "./daos/implementaciones/ProductDAO";
import { CategoryDAO } from "./daos/implementaciones/CategoryDAO";
import { BrandDAO } from "./daos/implementaciones/BrandDAO";
import { SubCategoryDAO } from "./daos/implementaciones/SubCategoryDAO";
import { ProductImageDAO } from "./daos/implementaciones/ProductImageDAO";
import { LabelDAO } from "./daos/implementaciones/LabelDAO";
import { UsuarioDAO } from "./daos/implementaciones/UsuarioDAO";
import { UsuarioRolDAO } from "./daos/implementaciones/UsuarioRolDAO";
import { RolDAO } from "./daos/implementaciones/RolDAO";

/**
 * Punto central de acceso a datos.
 * Instancia y expone todos los DAOs y los clientes de Prisma y Supabase.
 * Debe ser creado una vez por request para evitar conexiones duplicadas.
 */
export class AccesoDatos implements IAccesoDatos {
  /** Cliente Prisma para consultas a PostgreSQL. */
  public readonly prisma: PrismaClient;
  /** Cliente Supabase para almacenamiento de imágenes. */
  public readonly supabase: SupabaseClient;

  /** DAO de productos. */
  public readonly productDAO: IProductDAO;
  /** DAO de categorías. */
  public readonly categoryDAO: ICategoryDAO;
  /** DAO de marcas. */
  public readonly brandDAO: IBrandDAO;
  /** DAO de subcategorías. */
  public readonly subCategoryDAO: ISubCategoryDAO;
  /** DAO de imágenes de producto. */
  public readonly productImageDAO: IProductImageDAO;
  /** DAO de etiquetas (atributos físicos). */
  public readonly labelDAO: ILabelDAO;
  /** DAO de usuarios. */
  public readonly usuarioDAO: IUsuarioDAO;
  /** DAO de relaciones usuario-rol. */
  public readonly usuarioRolDAO: IUsuarioRolDAO;
  /** DAO de roles. */
  public readonly rolDAO: IRolDAO;

  constructor() {
    this.prisma = PrismaFactory.getCliente();
    this.supabase = SupabaseFactory.getCliente();

    this.productDAO = new ProductDAO(this.prisma);
    this.categoryDAO = new CategoryDAO(this.prisma);
    this.brandDAO = new BrandDAO(this.prisma);
    this.subCategoryDAO = new SubCategoryDAO(this.prisma);
    this.productImageDAO = new ProductImageDAO(this.prisma, this.supabase);
    this.labelDAO = new LabelDAO(this.prisma);
    this.usuarioDAO = new UsuarioDAO(this.prisma);
    this.usuarioRolDAO = new UsuarioRolDAO(this.prisma);
    this.rolDAO = new RolDAO(this.prisma);
  }
}
