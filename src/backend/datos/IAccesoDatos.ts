import { PrismaClient } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

export interface IAccesoDatos {
  readonly prisma: PrismaClient;
  readonly supabase: SupabaseClient;
}
