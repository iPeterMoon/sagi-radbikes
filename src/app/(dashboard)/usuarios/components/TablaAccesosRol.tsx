"use client";

import { RolDTO } from "@/types/dtos";
import { MODULOS_CONFIGURABLES } from "@/lib/modulos";
import { usuariosApi } from "@/lib/api/usuarios";
import Toggle from "@/components/ui/Toggle";

interface TablaAccesosRolProps {
  roles: RolDTO[];
  onRolesChange: (roles: RolDTO[]) => void;
}

/** Ids de los roles del usuario logueado, leídos de `localStorage`. */
function obtenerIdsRolesPropios(): string[] {
  try {
    const usuarioStr = localStorage.getItem("usuario");
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    return (usuario?.roles ?? []).map((r: { idRol: string }) => r.idRol);
  } catch {
    return [];
  }
}

/**
 * Matriz de accesos: un rol por fila, un módulo por columna. Cada celda es
 * un toggle que guarda de inmediato al hacer click (mismo patrón que ya usa
 * el toggle de "Activo" en la tabla de productos). Punto de Venta se muestra
 * siempre tildado y deshabilitado: todo usuario logueado tiene acceso a POS
 * sin importar sus roles.
 */
export default function TablaAccesosRol({ roles, onRolesChange }: TablaAccesosRolProps) {
  const idsRolesPropios = obtenerIdsRolesPropios();

  const handleToggle = async (rol: RolDTO, moduloId: string) => {
    const tieneAcceso = rol.modulos.includes(moduloId);
    const modulosNuevos = tieneAcceso
      ? rol.modulos.filter((m) => m !== moduloId)
      : [...rol.modulos, moduloId];

    try {
      const rolActualizado = await usuariosApi.actualizarRol({
        ...rol,
        modulos: modulosNuevos,
      });
      onRolesChange(roles.map((r) => (r.idRol === rol.idRol ? rolActualizado : r)));
    } catch (error) {
      console.error("Error al actualizar accesos del rol:", error);
    }
  };

  if (roles.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3 text-left text-[12px] font-semibold text-gray-500">
                Rol
              </th>
              {MODULOS_CONFIGURABLES.map((modulo) => (
                <th
                  key={modulo.id}
                  className="px-5 py-3 text-center text-[12px] font-semibold text-gray-500"
                >
                  {modulo.label}
                </th>
              ))}
              <th className="px-5 py-3 text-center text-[12px] font-semibold text-gray-400">
                Punto de Venta
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((rol) => {
              const esRolPropio = idsRolesPropios.includes(rol.idRol);
              return (
                <tr
                  key={rol.idRol}
                  className="border-b border-gray-100 last:border-none hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5 font-semibold text-gray-900">{rol.nombre}</td>
                  {MODULOS_CONFIGURABLES.map((modulo) => {
                    const esUsuariosPropio = esRolPropio && modulo.id === "usuarios";
                    return (
                      <td key={modulo.id} className="px-5 py-3.5">
                        <div
                          className="flex justify-center"
                          title={
                            esUsuariosPropio
                              ? "No podés quitarte el acceso a Usuarios"
                              : undefined
                          }
                        >
                          <Toggle
                            checked={rol.modulos.includes(modulo.id)}
                            onChange={() => handleToggle(rol, modulo.id)}
                            disabled={esUsuariosPropio}
                          />
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-5 py-3.5">
                    <div
                      className="flex justify-center"
                      title="Punto de Venta siempre está disponible para todos los roles"
                    >
                      <Toggle checked onChange={() => {}} disabled />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
