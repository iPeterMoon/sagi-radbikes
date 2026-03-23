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

export class AccesoDatos implements IAccesoDatos {
  public readonly prisma: PrismaClient;
  public readonly supabase: SupabaseClient;

  public readonly productDAO: IProductDAO;
  public readonly categoryDAO: ICategoryDAO;
  public readonly brandDAO: IBrandDAO;
  public readonly subCategoryDAO: ISubCategoryDAO;
  public readonly productImageDAO: IProductImageDAO;
  public readonly labelDAO: ILabelDAO;
  public readonly usuarioDAO: IUsuarioDAO;
  public readonly usuarioRolDAO: IUsuarioRolDAO;
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
