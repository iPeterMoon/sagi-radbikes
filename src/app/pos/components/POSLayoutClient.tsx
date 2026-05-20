"use client";
 
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export const xmlRequestHeaders = {
  "Content-Type": "application/xml",
  "Accept": "application/xml",
};

/**
 * Shell de cliente para el layout del POS.
 * Gestiona el estado de visibilidad del sidebar y renderiza
 * el esqueleto de página a pantalla completa (sin scroll externo).
 */
export default function POSLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
 
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Topbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active="pos" open={sidebarOpen} />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}