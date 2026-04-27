import { SelectHTMLAttributes, ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Icono opcional a mostrar en el lado izquierdo del selector. */
  icon?: ReactNode;
  /** Lista de opciones a renderizar. */
  options: string[];
  /** Texto del placeholder mostrado cuando ningún valor está seleccionado. */
  placeholder?: string;
}

/**
 * Selector desplegable estilizado con soporte para icono izquierdo y placeholder.
 * Incluye un chevron SVG personalizado que reemplaza el indicador nativo del navegador.
 */
export default function Select({
  icon,
  options,
  placeholder = "Seleccionar...",
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="relative w-full">
      {icon && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center pointer-events-none z-10">
          {icon}
        </span>
      )}
      <select
        {...props}
        className={`w-full py-2.25 pr-8 border border-gray-200 rounded-lg text-[13px] text-gray-900 outline-none bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          icon ? "pl-7.5" : "pl-3"
        } ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {/* Chevron */}
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </div>
  );
}
