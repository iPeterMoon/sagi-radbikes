import { createClient, SupabaseClient } from "@supabase/supabase-js";

declare global {
  var supabaseGlobal: SupabaseClient | undefined;
}

export class SupabaseFactory {
  private constructor() {}

  static getCliente(): SupabaseClient {
    if (!globalThis.supabaseGlobal) {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!url || !key) {
        throw new Error(
          "Faltan las variables de entorno de Supabase (URL o KEY).",
        );
      }

      globalThis.supabaseGlobal = createClient(url, key);
    }

    return globalThis.supabaseGlobal;
  }
}
