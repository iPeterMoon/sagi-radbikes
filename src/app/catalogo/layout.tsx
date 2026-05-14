"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { authApi } from "@/lib/api/auth";

/**
 * Layout del módulo de Catálogo.
 * Renderiza la barra lateral de navegación y la barra superior.
 * Valida la sesión del usuario y redirige a login si no está autenticado.
 * @param children - Contenido que se renderizará en el área principal
 */
export default function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Al no poder usar 'metadata' en componentes de cliente,
    // manejamos el título de la pestaña directamente aquí.
    document.title = "Catálogo - RAD Bikes";

    const checkSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const user = await authApi.validate();
        localStorage.setItem("usuario", JSON.stringify(user));
        window.dispatchEvent(new Event("usuarioUpdated"));
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        router.push("/login");
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Topbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active="catalogo" open={sidebarOpen} onLogout={handleLogout} />
        <main className="flex-1 py-7 px-8 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
