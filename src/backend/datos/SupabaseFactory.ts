import { createClient, SupabaseClient } from "@supabase/supabase-js";

declare global {
  var supabaseGlobal: SupabaseClient | undefined;
}

export class SupabaseFactory {
  private constructor() {}

  static getCliente(): SupabaseClient {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        "Faltan las variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY",
      );
    }

    if (process.env.NODE_ENV === "production") {
      return createClient(url, key);
    }

    if (!globalThis.supabaseGlobal) {
      globalThis.supabaseGlobal = createClient(url, key);
    }

    return globalThis.supabaseGlobal;
  }
}
