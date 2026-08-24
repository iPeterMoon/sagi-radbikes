import { ReporteVentasDTO } from "@/types/dtos";

/** URL base para los endpoints de reportes. */
const API_BASE = "/api/reportes";

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

/** Conjunto de funciones para interactuar con la API de reportes. */
export const reportesApi = {
  /** Obtiene el reporte de ventas para un rango de fechas ("YYYY-MM-DD"). */
  async obtenerReporteVentas(desde: string, hasta: string): Promise<ReporteVentasDTO> {
    const params = new URLSearchParams({ desde, hasta });
    return fetchApi<ReporteVentasDTO>(`${API_BASE}/ventas?${params}`);
  },
};
