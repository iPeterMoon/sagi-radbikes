"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usuariosApi } from "@/lib/api/usuarios";
import { Usuario, ModalUsuarioType, FiltroEstado } from "@/types/usuarios";
import { UsuarioDTO, RolDTO } from "@/types/dtos";
import { IconSearch, IconPlus } from "@/components/ui/Icons";
import UsuarioFormModal from "./components/UsuarioFormModal";
import { NuevoUsuarioDTO } from "@/types/dtos";
import Toggle from "@/components/ui/Toggle";

const PER_PAGE = 8;

function mapDtoToUsuario(dto: UsuarioDTO): Usuario {
  return {
    idUsuario: dto.idUsuario,
    username: dto.username,
    nombre: dto.nombre || "",
    apellido: dto.apellido || "",
    email: dto.email || "",
    telefono: dto.telefono,
    is_active: dto.is_active ?? true,
    roles: dto.roles || [],
  };
}

function getIniciales(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

const AVATAR_COLORS = [
  { bg: "#dbeafe", text: "#1d4ed8" },
  { bg: "#ede9fe", text: "#6d28d9" },
  { bg: "#dcfce7", text: "#15803d" },
  { bg: "#ffedd5", text: "#c2410c" },
  { bg: "#fce7f3", text: "#be185d" },
];

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function RolBadge({ nombre }: { nombre: string }) {
  const esDueno = nombre.toLowerCase().includes("due");
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: 500,
        marginRight: "4px",
        background: esDueno ? "#ede9fe" : "#dbeafe",
        color: esDueno ? "#6d28d9" : "#1d4ed8",
      }}
    >
      {nombre}
    </span>
  );
}

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<RolDTO[]>([]);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("activos");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalUsuarioType>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthError = useCallback((error: any) => {
    const msg = error?.message || "";
    if (msg.includes("Unauthorized") || msg.includes("No token provided")) {
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.replace("/login");
      return true;
    }
    return false;
  }, [router]);

  const handleSave = async (data: NuevoUsuarioDTO | Usuario) => {
    try {
      if (modal?.type === "edit") {
        const dto: UsuarioDTO = {
          idUsuario: (data as Usuario).idUsuario,
          username: (data as Usuario).username,
          nombre: (data as Usuario).nombre,
          apellido: (data as Usuario).apellido,
          email: (data as Usuario).email,
          telefono: (data as Usuario).telefono!,
          is_active: (data as Usuario).is_active,
          roles: (data as Usuario).roles,
        };
        await usuariosApi.actualizarUsuario(dto);
        setModal({ type: "success-edit" });
      } else {
        await usuariosApi.crearUsuario(data as NuevoUsuarioDTO);
        setModal({ type: "success-add" });
      }
      await loadUsuarios();
    } catch (error: any) {
      console.error("Error guardando usuario:", error);
    }
  };

  const loadUsuarios = useCallback(async () => {
      try {
        const dtos = await usuariosApi.obtenerUsuarios();
        setUsuarios(dtos.map(mapDtoToUsuario));
      } catch (error) {
        if (!handleAuthError(error))
          console.error("Error cargando usuarios:", error);
      }
    }, [handleAuthError]);

  const loadRoles = async () => {
    try {
      const data = await usuariosApi.obtenerRoles();
      setRoles(data);
    } catch (error) {
      console.error("Error cargando roles:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([loadUsuarios(), loadRoles()]);
      setIsLoading(false);
    };
    init();
  }, [loadUsuarios]);

  const handleToggle = async (usuario: Usuario) => {
    try {
      await usuariosApi.alternarActivo(usuario.idUsuario);
      await loadUsuarios();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const filtered = usuarios.filter((u) => {
    const q = search.toLowerCase();
    if (
      q &&
      !u.nombre.toLowerCase().includes(q) &&
      !u.apellido.toLowerCase().includes(q) &&
      !u.username.toLowerCase().includes(q) &&
      !u.email.toLowerCase().includes(q)
    )
      return false;
    if (filtroEstado === "activos" && !u.is_active) return false;
    if (filtroEstado === "inactivos" && u.is_active) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const filterBtnClass = (active: boolean) =>
    `px-4 py-[9px] rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-150 border outline-none ${
      active
        ? "border-transparent bg-blue-50 text-blue-600"
        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 m-0">
          Gestión de usuarios
        </h1>
        <button
          onClick={() => setModal({ type: "add" })}
          className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg px-5 py-2.5 cursor-pointer text-sm font-bold flex items-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-colors"
        >
          <IconPlus /> Nuevo usuario
        </button>
      </div>

      <div className="flex gap-2.5 mb-4 flex-wrap items-center">
        <div className="relative flex-[1_1_280px] min-w-50">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </span>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre, usuario o email..."
            className="w-full py-2.25 pl-9 pr-3 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none bg-white focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
        <button
          onClick={() => {
            setFiltroEstado("activos");
            setPage(1);
          }}
          className={filterBtnClass(filtroEstado === "activos")}
        >
          Activos
        </button>
        <button
          onClick={() => {
            setFiltroEstado("inactivos");
            setPage(1);
          }}
          className={filterBtnClass(filtroEstado === "inactivos")}
        >
          Inactivos
        </button>
        <button
          onClick={() => {
            setFiltroEstado("todos");
            setPage(1);
          }}
          className={filterBtnClass(filtroEstado === "todos")}
        >
          Todos
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium">Cargando usuarios...</p>
          </div>
        ) : (
          <>
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-[12px] font-semibold text-gray-500">
                    Usuario
                  </th>
                  <th className="px-5 py-3 text-left text-[12px] font-semibold text-gray-500">
                    Roles
                  </th>
                  <th className="px-5 py-3 text-left text-[12px] font-semibold text-gray-500">
                    Teléfono
                  </th>
                  <th className="px-5 py-3 text-left text-[12px] font-semibold text-gray-500">
                    Activo
                  </th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-gray-400 text-sm"
                    >
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  paginated.map((usuario, index) => {
                    const color = getAvatarColor(index);
                    return (
                      <tr
                        key={usuario.idUsuario}
                        className="border-b border-gray-100 last:border-none hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              style={{
                                background: color.bg,
                                color: color.text,
                              }}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0"
                            >
                              {getIniciales(usuario.nombre, usuario.apellido)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {usuario.nombre} {usuario.apellido}
                              </div>
                              <div className="text-[12px] text-gray-400">
                                @{usuario.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {usuario.roles.map((rol) => (
                            <RolBadge key={rol.idRol} nombre={rol.nombre} />
                          ))}
                          {usuario.roles.length === 0 && (
                            <span className="text-gray-400 text-[12px]">
                              Sin roles
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">
                          {usuario.telefono || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <Toggle
                            checked={usuario.is_active}
                            onChange={() => handleToggle(usuario)}
                          />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setModal({ type: "edit", usuario })}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer bg-white"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-[13px] text-gray-500 font-medium">
                Mostrando {paginated.length} de {filtered.length} usuarios
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3.5 py-1.5 rounded-md border border-gray-200 text-[13px] font-medium transition-colors ${page === 1 ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"}`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={`px-3.5 py-1.5 rounded-md border border-gray-200 text-[13px] font-medium transition-colors ${page >= totalPages ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"}`}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modales van aquí */}
      {(modal?.type === "add" || modal?.type === "edit") && (
        <UsuarioFormModal
          usuario={modal.type === "edit" ? modal.usuario : null}
          rolesDisponibles={roles}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
