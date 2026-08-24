"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { authApi } from "@/lib/api/auth";

/** Mapeo de rutas a IDs del sidebar. */
const ROUTE_TO_ACTIVE: Record<string, string> = {
  "/catalogo": "catalogo",
  "/pos": "pos",
  "/dashboard": "dashboard",
  "/reportes": "reportes",
  "/usuarios": "usuarios",
  "/configuracion": "configuracion",
};

/** Mapeo de rutas a títulos de pestaña. */
const ROUTE_TO_TITLE: Record<string, string> = {
  "/catalogo": "Catálogo - RAD Bikes",
  "/pos": "POS - RAD Bikes",
  "/dashboard": "Dashboard - RAD Bikes",
  "/reportes": "Reportes - RAD Bikes",
  "/usuarios": "Usuarios - RAD Bikes",
  "/configuracion": "Configuración - RAD Bikes",
};

/** Rutas donde el main tiene overflow hidden (como POS). */
const FULLSCREEN_ROUTES = ["/pos"];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const activeSection = ROUTE_TO_ACTIVE[pathname] || "dashboard";
  const isFullscreen = FULLSCREEN_ROUTES.includes(pathname);

  useEffect(() => {
    document.title = ROUTE_TO_TITLE[pathname] || "RAD Bikes";

    const checkSession = async () => {
      try {
        const user = await authApi.validate();
        localStorage.setItem("usuario", JSON.stringify(user));
        window.dispatchEvent(new Event("usuarioUpdated"));
      } catch {
        localStorage.removeItem("usuario");
        router.push("/login");
      }
    };

    checkSession();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      router.push("/login");
    }
  };

  return (
    <div className={`flex flex-col ${isFullscreen ? "h-screen" : "min-h-screen"} bg-gray-50`}>
      <Topbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activeSection} open={sidebarOpen} onLogout={handleLogout} />
        <main className={`flex-1 overflow-x-hidden ${isFullscreen ? "overflow-hidden" : "overflow-y-auto py-7 px-8"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}