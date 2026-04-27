"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SidebarProps } from "@/types/inventory";
import { authApi } from "@/lib/api/auth";
import {
  IconCatalog,
  IconPOS,
  IconLogout,
} from "@/components/ui/Icons";

interface NavItem {
  id: string;
  label: string;
  href: string;
  Icon: React.FC;
}

/** Elementos de navegación principal del sistema. */
const NAV_ITEMS: NavItem[] = [
  { id: "catalogo",  label: "Catálogo",         href: "/catalogo", Icon: IconCatalog   },
  { id: "pos",       label: "Punto de Venta",   href: "/pos",    Icon: IconPOS       },
];

/**
 * Barra lateral de navegación.
 * Muestra los enlaces principales y el botón de cerrar sesión.
 * Se oculta/expande según la prop `open`.
 */
export default function Sidebar({ active, open }: SidebarProps) {
  const router = useRouter();

  /**
   * Ejecuta el logout a través de la API y redirige a la página de login.
   * El bloque `finally` garantiza la redirección incluso si la llamada falla.
   */
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
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
          {NAV_ITEMS.map(({ id, label, href, Icon }) => {
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