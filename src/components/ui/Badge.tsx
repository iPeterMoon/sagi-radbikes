import { BadgeProps, StockStatus } from "@/types/inventory";

interface BadgeConfig {
  twClass: string;
  label: string;
}

/** Mapeo de cada estado de stock a sus estilos y etiqueta visual. */
const STATUS_MAP: Record<StockStatus, BadgeConfig> = {
  NORMAL: { twClass: "bg-green-100 text-green-600", label: "NORMAL" },
  BAJO: { twClass: "bg-orange-100 text-orange-600", label: "BAJO" },
  CRÍTICO: { twClass: "bg-red-100 text-red-600", label: "CRÍTICO" },
};

/**
 * Insignia de color que indica el estado de stock de un producto.
 * Muestra "NORMAL", "BAJO" o "CRÍTICO" con colores semánticos.
 */
export default function Badge({ status }: BadgeProps) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.NORMAL;

  return (
    <span
      className={`${s.twClass} text-[10px] font-bold tracking-[0.06em] px-2 py-0.75 rounded`}
    >
      {s.label}
    </span>
  );
}
