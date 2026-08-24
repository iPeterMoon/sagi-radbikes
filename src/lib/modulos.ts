/**
 * Registro central de los módulos de la app. Sin dependencias de React ni
 * Prisma para poder importarse tanto en el cliente (`Sidebar`) como en el
 * middleware de Next.js (`src/proxy.ts`), que corre en un runtime que no
 * puede tocar la base de datos directamente.
 *
 * "pos" no requiere configuración de acceso: es un piso implícito que
 * tiene cualquier usuario logueado sin importar sus roles (ver
 * `UsuarioMapper.toDTO`).
 */
export const MODULOS = [
  { id: "dashboard", label: "Dashboard", ruta: "/dashboard" },
  { id: "catalogo", label: "Catálogo", ruta: "/catalogo" },
  { id: "pos", label: "Punto de Venta", ruta: "/pos" },
  { id: "reportes", label: "Reportes", ruta: "/reportes" },
  { id: "usuarios", label: "Usuarios", ruta: "/usuarios" },
  { id: "configuracion", label: "Configuración", ruta: "/configuracion" },
] as const;

export type ModuloId = (typeof MODULOS)[number]["id"];

/** Módulos configurables por rol (todos menos "pos", que es un piso implícito). */
export const MODULOS_CONFIGURABLES = MODULOS.filter((m) => m.id !== "pos");

/** Prefijos de ruta (página y su API correspondiente) que pertenecen a cada módulo. */
export const PREFIJOS_POR_MODULO: Record<ModuloId, string[]> = {
  dashboard: ["/dashboard", "/api/dashboard"],
  catalogo: ["/catalogo", "/api/inventario"],
  pos: ["/pos", "/api/pos", "/api/print"],
  reportes: ["/reportes", "/api/reportes"],
  usuarios: ["/usuarios", "/api/users", "/api/roles"],
  configuracion: ["/configuracion", "/api/configuracion"],
};

/**
 * Determina a qué módulo pertenece una ruta, si corresponde a alguno
 * (rutas como `/login` o `/api/auth/*` no pertenecen a ningún módulo).
 */
export function obtenerModuloDeRuta(pathname: string): ModuloId | null {
  for (const modulo of MODULOS) {
    if (PREFIJOS_POR_MODULO[modulo.id].some((prefijo) => pathname.startsWith(prefijo))) {
      return modulo.id;
    }
  }
  return null;
}
