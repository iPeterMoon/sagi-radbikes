import { createClient, SupabaseClient } from "@supabase/supabase-js";

declare global {
  var supabaseGlobal: SupabaseClient | undefined;
}

/**
 * Clase de fábrica que implementa el patrón Singleton para gestionar y
 * proveer una única instancia del cliente de Supabase en toda la aplicación.
 */
export class SupabaseFactory {
  /**
   * Constructor privado para evitar la instanciación directa de la clase,
   * asegurando el cumplimiento del patrón Singleton.
   */
  private constructor() {}

  /**
   * Obtiene la instancia global del cliente de Supabase. Si aún no ha sido creada,
   * la inicializa utilizando las variables de entorno de configuración.
   *
   * @returns La instancia única y global de SupabaseClient.
   * @throws Error si faltan las variables de entorno necesarias (URL o KEY) para la conexión.
   */
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
