import { PrismaClient } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

import { IProductDAO } from "./daos/interfaces/IProductDAO";
import { ICategoryDAO } from "./daos/interfaces/ICategoryDAO";
import { IBrandDAO } from "./daos/interfaces/IBrandDAO";
import { ISubCategoryDAO } from "./daos/interfaces/ISubCategoryDAO";
import { IProductImageDAO } from "./daos/interfaces/IProductImageDAO";
import { ILabelDAO } from "./daos/interfaces/ILabelDAO";
import { IUsuarioDAO } from "./daos/interfaces/IUsuarioDAO";
import { IUsuarioRolDAO } from "./daos/interfaces/IUsuarioRolDAO";
import { IRolDAO } from "./daos/interfaces/IRolDAO";

export interface IAccesoDatos {
  readonly prisma: PrismaClient;
  readonly supabase: SupabaseClient;

  readonly productDAO: IProductDAO;
  readonly categoryDAO: ICategoryDAO;
  readonly brandDAO: IBrandDAO;
  readonly subCategoryDAO: ISubCategoryDAO;
  readonly productImageDAO: IProductImageDAO;
  readonly labelDAO: ILabelDAO;
  readonly usuarioDAO: IUsuarioDAO;
  readonly usuarioRolDAO: IUsuarioRolDAO;
  readonly rolDAO: IRolDAO;
}
