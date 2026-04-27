"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

/**
 * Shell de cliente para el layout del catálogo.
 * Gestiona el estado de visibilidad del sidebar y renderiza
 * el esqueleto de página (Topbar + Sidebar + contenido principal).
 */
export default function CatalogoLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Topbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active="catalogo" open={sidebarOpen} />
        <main className="flex-1 py-7 px-8 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
