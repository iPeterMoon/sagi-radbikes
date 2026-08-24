import { DashboardResumenDTO } from "@/types/dtos";

/** URL base para los endpoints del dashboard. */
const API_BASE = "/api/dashboard";

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

/** Conjunto de funciones para interactuar con la API del dashboard. */
export const dashboardApi = {
  /** Obtiene el resumen de KPIs (ventas, top productos y margen). */
  async obtenerResumen(): Promise<DashboardResumenDTO> {
    return fetchApi<DashboardResumenDTO>(`${API_BASE}/resumen`);
  },
};
