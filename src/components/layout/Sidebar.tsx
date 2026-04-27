"use client";

import { SidebarProps } from "@/types/inventory";
import {
  IconDashboard,
  IconCatalog,
  IconPOS,
  IconReports,
  IconLogout,
} from "@/components/ui/Icons";

interface NavItem {
  id: string;
  label: string;
  Icon: React.FC;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", Icon: IconDashboard },
  { id: "catalogo", label: "Catálogo", Icon: IconCatalog },
  { id: "pos", label: "Punto de Venta", Icon: IconPOS },
  { id: "reportes", label: "Reportes", Icon: IconReports },
];

export default function Sidebar({ active, open, onLogout }: SidebarProps) {
  return (
    <aside
      className={`min-h-[calc(100vh-56px)] bg-white flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
        open ? "w-60 border-r border-gray-200" : "w-0 border-none"
      }`}
    >
      <div className="w-60 flex flex-col flex-1">
        {" "}
        <nav className="flex-1 p-4 px-3">
          {" "}
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = active === id;
            return (
              <div
                key={id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm cursor-pointer whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "bg-transparent text-gray-500 font-normal hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <Icon />
                {label}
              </div>
            );
          })}
        </nav>
        <div className="p-4 px-3 border-t border-gray-100">
          <div
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 text-sm cursor-pointer whitespace-nowrap hover:bg-red-50 transition-colors"
          >
            <IconLogout />
            Cerrar Sesión
          </div>
        </div>
      </div>
    </aside>
  );
}
