import { LoginDTO } from "@/backend/negocio/DTOsEntrada/LoginDTO";
import { SesionDTO } from "@/backend/negocio/DTOsSalida/SesionDTO";

/** URL base para los endpoints de autenticación. */
const API_BASE = "/api/auth";

/**
 * Utilidad genérica para peticiones HTTP que incluye credenciales de cookie.
 * Lanza un `Error` si la respuesta no es `ok`.
 * @param url - URL absoluta o relativa del recurso
 * @param options - Opciones adicionales de `fetch`
 * @returns Respuesta deserializada como `T`
 */
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

/** Conjunto de funciones para interactuar con la API de autenticación. */
export const authApi = {
  /**
   * Inicia sesión enviando credenciales al servidor.
   * El servidor responde con los datos de sesión y establece la cookie `token`.
   * @param credenciales - Username y password
   * @returns Datos de sesión con token JWT y usuario
   */
  async login(credenciales: LoginDTO): Promise<SesionDTO> {
    return fetchApi<SesionDTO>(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credenciales),
    });
  },

  /**
   * Cierra la sesión del usuario: llama al endpoint de logout y limpia
   * el dato de usuario almacenado en `localStorage`.
   */
  async logout(): Promise<void> {
    await fetchApi<void>(`${API_BASE}/logout`, {
      method: "POST",
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem("usuario");
    }
  },

  /**
   * Valida el token de sesión activo (cookie httpOnly) contra el servidor.
   * @returns Datos del usuario si el token es válido
   */
  async validate(): Promise<any> {
    return fetchApi<any>(`${API_BASE}/validate`);
  },
};
