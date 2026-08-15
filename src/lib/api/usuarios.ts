import { UsuarioDTO, NuevoUsuarioDTO, ActualizarUsuarioDTO, RolDTO, NuevoRolDTO } from "@/types/dtos";

const API_BASE_USUARIOS = "/api/users";
const API_BASE_ROLES = "/api/roles";

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

export const usuariosApi = {
  async obtenerUsuarios(): Promise<UsuarioDTO[]> {
    return fetchApi<UsuarioDTO[]>(API_BASE_USUARIOS);
  },

  async obtenerUsuarioPorId(id: string): Promise<UsuarioDTO> {
    return fetchApi<UsuarioDTO>(`${API_BASE_USUARIOS}/${id}`);
  },

  async crearUsuario(usuario: NuevoUsuarioDTO): Promise<UsuarioDTO> {
    return fetchApi<UsuarioDTO>(API_BASE_USUARIOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario),
    });
  },

  async actualizarUsuario(usuario: ActualizarUsuarioDTO): Promise<UsuarioDTO> {
    return fetchApi<UsuarioDTO>(`${API_BASE_USUARIOS}/${usuario.idUsuario}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario),
    });
  },

  async alternarActivo(id: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE_USUARIOS}/${id}`, {
      method: "PATCH",
    });
  },

  async obtenerRoles(): Promise<RolDTO[]> {
    return fetchApi<RolDTO[]>(API_BASE_ROLES);
  },

  async crearRol(rol: NuevoRolDTO): Promise<RolDTO> {
    return fetchApi<RolDTO>(API_BASE_ROLES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rol),
    });
  },
};