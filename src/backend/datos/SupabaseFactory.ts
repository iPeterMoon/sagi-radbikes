import { createClient, SupabaseClient } from "@supabase/supabase-js";

declare global {
  var supabaseGlobal: SupabaseClient | undefined;
}

export class SupabaseFactory {
  private constructor() {}

  static getCliente(): SupabaseClient {
    if (process.env.NODE_ENV === "production") {
      return createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );
    }

    if (!globalThis.supabaseGlobal) {
      globalThis.supabaseGlobal = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );
    }
    return globalThis.supabaseGlobal;
  }
}
