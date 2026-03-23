import { LoginDTO } from "@/backend/negocio/DTOsEntrada/LoginDTO";
import { SesionDTO } from "@/backend/negocio/DTOsSalida/SesionDTO";

const API_BASE = "/api/auth";

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

export const authApi = {
  async login(credenciales: LoginDTO): Promise<SesionDTO> {
    return fetchApi<SesionDTO>(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credenciales),
    });
  },

  async logout(): Promise<void> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    await fetchApi<void>(`${API_BASE}/logout`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    }
  },

  async validate(): Promise<any> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) throw new Error("No token");
    return fetchApi<any>(`${API_BASE}/validate`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
