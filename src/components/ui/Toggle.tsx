import { ToggleProps } from "@/types/inventory";

/**
 * Interruptor (toggle switch) accesible que usa `role="switch"` y `aria-checked`.
 * Cambia entre estado activo (azul) e inactivo (gris).
 */
export default function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`w-10 h-5.5 rounded-full relative cursor-pointer transition-colors duration-200 ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-all duration-200 shadow-sm ${
          checked ? "left-5.25" : "left-0.75"
        }`}
      />
    </div>
  );
}
