import { PrismaClient } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { IProductDAO } from "./IProductDAO";
import { ICategoryDAO } from "./ICategoryDAO";
import { IBrandDAO } from "./IBrandDAO";
import { ISubCategoryDAO } from "./ISubCategoryDAO";
import { IProductImageDAO } from "./IProductImageDAO";
import { ILabelDAO } from "./ILabelDAO";

/**
 * Interfaz que centraliza el acceso a todos los DAOs del catálogo.
 * Proporciona acceso a la base de datos Prisma, almacenamiento Supabase,
 * y todos los Data Access Objects necesarios para gestionar productos,
 * categorías, marcas, subcategorías, imágenes y etiquetas.
 */
export interface ICatalogoAccesoDatos {
  /** Cliente Prisma para acceso a base de datos PostgreSQL. */
  readonly prisma: PrismaClient;

  /** Cliente Supabase para almacenamiento de objetos (imágenes). */
  readonly supabase: SupabaseClient;

  /** DAO para operaciones sobre productos. */
  readonly productDAO: IProductDAO;

  /** DAO para operaciones sobre categorías. */
  readonly categoryDAO: ICategoryDAO;

  /** DAO para operaciones sobre marcas. */
  readonly brandDAO: IBrandDAO;

  /** DAO para operaciones sobre subcategorías. */
  readonly subCategoryDAO: ISubCategoryDAO;

  /** DAO para operaciones sobre imágenes de productos. */
  readonly productImageDAO: IProductImageDAO;

  /** DAO para operaciones sobre etiquetas/labels. */
  readonly labelDAO: ILabelDAO;
}
