import { ConfiguracionDTO, ActualizarConfiguracionDTO } from "@/types/dtos";

/** URL base para los endpoints de configuración. */
const API_BASE = "/api/configuracion";

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

/** Conjunto de funciones para interactuar con la API de configuración. */
export const configuracionApi = {
  /** Obtiene la configuración vigente del sistema. */
  async obtener(): Promise<ConfiguracionDTO> {
    return fetchApi<ConfiguracionDTO>(API_BASE);
  },

  /** Actualiza la configuración del sistema. */
  async actualizar(dto: ActualizarConfiguracionDTO): Promise<ConfiguracionDTO> {
    return fetchApi<ConfiguracionDTO>(API_BASE, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
  },
};
