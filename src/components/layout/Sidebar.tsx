"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProps } from "@/types/inventory";
import { authApi } from "@/lib/api/auth";
import { MODULOS, ModuloId } from "@/lib/modulos";
import {
  IconDashboard,
  IconCatalog,
  IconPOS,
  IconReports,
  IconLogout,
} from "@/components/ui/Icons";
import { User, Cog } from "@boxicons/react";

interface NavItem {
  id: string;
  label: string;
  href: string;
  Icon: React.FC;
}

/** Ícono de cada módulo, por id. La lista/orden/labels vienen de `MODULOS`. */
const ICONOS_POR_MODULO: Record<ModuloId, React.FC> = {
  dashboard: IconDashboard,
  catalogo: IconCatalog,
  pos: IconPOS,
  reportes: IconReports,
  usuarios: User,
  configuracion: Cog,
};

/** Elementos de navegación principal del sistema. */
const NAV_ITEMS: NavItem[] = MODULOS.map((modulo) => ({
  id: modulo.id,
  label: modulo.label,
  href: modulo.ruta,
  Icon: ICONOS_POR_MODULO[modulo.id],
}));

/**
 * Barra lateral de navegación.
 * Muestra los enlaces principales y el botón de cerrar sesión.
 * Se oculta/expande según la prop `open`. Los enlaces se filtran según los
 * módulos permitidos del usuario logueado (`usuario.modulosPermitidos` en
 * localStorage) — es solo UX, la protección real está en `src/proxy.ts`.
 */
export default function Sidebar({ active, open, onLogout }: SidebarProps) {
  const router = useRouter();
  const [modulosPermitidos, setModulosPermitidos] = useState<string[] | null>(null);

  useEffect(() => {
    const leerModulosPermitidos = () => {
      try {
        const usuarioStr = localStorage.getItem("usuario");
        const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
        setModulosPermitidos(usuario?.modulosPermitidos ?? null);
      } catch {
        setModulosPermitidos(null);
      }
    };

    leerModulosPermitidos();
    window.addEventListener("usuarioUpdated", leerModulosPermitidos);
    return () => window.removeEventListener("usuarioUpdated", leerModulosPermitidos);
  }, []);

  const navItemsVisibles = modulosPermitidos
    ? NAV_ITEMS.filter((item) => modulosPermitidos.includes(item.id))
    : NAV_ITEMS;

  /**
   * Maneja el cierre de sesión. Si el Layout padre provee la función onLogout,
   * se utiliza esa. Si no, el Sidebar ejecuta su propia lógica de API y redirección.
   */
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }

    try {
      await authApi.logout();
    } finally {
      // Usamos "/login" como la ruta de entrada al login
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <aside
      className={`min-h-[calc(100vh-56px)] bg-white flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
        open ? "w-60 border-r border-gray-200" : "w-0 border-none"
      }`}
    >
      <div className="w-60 flex flex-col flex-1">
        <nav className="flex-1 p-4 px-3">
          {navItemsVisibles.map(({ id, label, href, Icon }) => {
            const isActive = active === id;
            return (
              <Link
                key={id}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm cursor-pointer whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "bg-transparent text-gray-500 font-normal hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 px-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 text-sm cursor-pointer whitespace-nowrap hover:bg-red-50 transition-colors bg-transparent border-none"
          >
            <IconLogout />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
