import { ToggleProps } from "@/types/inventory";

/**
 * Interruptor (toggle switch) accesible que usa `role="switch"` y `aria-checked`.
 * Cambia entre estado activo (azul) e inactivo (gris).
 */
export default function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onChange}
      className={`w-10 h-5.5 rounded-full relative transition-colors duration-200 ${
        checked ? "bg-blue-600" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-all duration-200 shadow-sm ${
          checked ? "left-5.25" : "left-0.75"
        }`}
      />
    </div>
  );
}
