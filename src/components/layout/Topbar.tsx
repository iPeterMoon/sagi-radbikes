"use client";

import { useState, useEffect } from "react";
import { TopbarProps } from "@/types/inventory";

function HamburgerIcon({ open }: { open: boolean }) {
  const baseBar =
    "block h-[2px] bg-white rounded-sm absolute transition-all duration-250 ease-out";

  return (
    <div className="relative w-5 h-3.5">
      <span
        className={`${baseBar} w-5 ${open ? "top-1.5 rotate-45" : "top-0"}`}
      />
      <span
        className={`${baseBar} ${open ? "top-1.5 w-0 opacity-0" : "top-1.5 w-5 opacity-100"}`}
      />
      <span
        className={`${baseBar} w-5 ${open ? "top-1.5 -rotate-45" : "top-3"}`}
      />
    </div>
  );
}

export default function Topbar({ sidebarOpen, onToggleSidebar }: TopbarProps) {
  const [usuario, setUsuario] = useState<{ username: string; roles: { nombre: string }[] } | null>(null);

  useEffect(() => {
    const usuarioStr = localStorage.getItem("usuario");
    if (usuarioStr) {
      setUsuario(JSON.parse(usuarioStr));
    }
  }, []);

  const displayName = usuario?.username || "Usuario";
  const roleName = usuario?.roles?.[0]?.nombre || "Rol";
  const initials = usuario?.username ? usuario.username.slice(0, 2).toUpperCase() : "US";

  return (
    <header className="h-14 bg-blue-900 flex items-center px-5 gap-3.5 shrink-0 sticky top-0 z-50">
      {/* Hamburger button */}
      <button
        onClick={onToggleSidebar}
        title={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
        aria-label="Toggle sidebar"
        aria-expanded={sidebarOpen}
        className="bg-white/10 hover:bg-white/20 border-none rounded-lg w-9 h-9 flex items-center justify-center cursor-pointer shrink-0 transition-colors"
      >
        <HamburgerIcon open={sidebarOpen} />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 w-35 shrink-0">
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-blue-400 flex items-center justify-center text-sm font-extrabold text-white">
          R
        </div>
        <span className="text-white font-bold text-base">RAD Bikes</span>
      </div>

      {/* Section title */}
      <div className="flex-1 text-center">
        <span className="text-blue-200 text-[15px] font-medium hidden sm:inline-block">
          Inventario
        </span>
      </div>

      {/* User info */}
      <div className="w-40 flex items-center justify-end gap-2.5 shrink-0">
        <div className="text-right hidden sm:block">
          <div className="text-white text-[13px] font-semibold">{displayName}</div>
          <div className="text-blue-300 text-[11px]">{roleName}</div>
        </div>
        <div className="w-8.5 h-8.5 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {initials}
        </div>
      </div>
    </header>
  );
}
