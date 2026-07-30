"use client";

import { useRef } from "react";
import { ScanBarcode, Search } from "@boxicons/react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Barra de búsqueda del POS.
 * Permite buscar por nombre, SKU o categoría.
 * El botón de código de barras hace foco en el input para facilitar el escaneo.
 */
export default function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full">
      {/* Search icon */}
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <Search size="sm" />
      </span>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar producto o escanear código..."
        className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1a2e5a]/20 focus:border-[#1a2e5a]/40 transition-all shadow-sm"
      />

      {/* Barcode scanner button */}
      <button
        type="button"
        onClick={() => inputRef.current?.focus()}
        title="Escanear código de barras"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a2e5a] transition-colors cursor-pointer bg-transparent border-none p-1"
      >
        <ScanBarcode size="sm" />
      </button>
    </div>
  );
}