/** Porcentaje de IVA vigente (16%). */
export const TASA_IVA = 16;

/** Redondea un importe a centavos evitando errores de coma flotante. */
export function redondearMonto(monto: number): number {
  return Math.round((monto + Number.EPSILON) * 100) / 100;
}

/** Desglose de un importe de línea en base, impuesto y total. */
export interface DesgloseIVA {
  /** Importe sin impuestos. */
  base: number;
  /** Impuesto correspondiente. */
  iva: number;
  /** Importe final (base + iva). */
  total: number;
}

/**
 * Desglosa el importe de una línea de venta.
 *
 * - Si `precioIncluyeIVA` es `false`, `monto` es el precio base y el IVA se
 *   calcula sumándolo (base + iva).
 * - Si es `true`, `monto` ya es el precio final y el IVA se extrae
 *   (total - total / (1 + tasa)).
 *
 * @param monto Importe de la línea (precio unitario × cantidad).
 * @param porcentaje Porcentaje de impuesto (ej. 16).
 * @param precioIncluyeIVA Indica si `monto` ya contiene el impuesto.
 */
export function desglosarIVA(
  monto: number,
  porcentaje: number = TASA_IVA,
  precioIncluyeIVA = false,
): DesgloseIVA {
  const factor = porcentaje / 100;

  if (precioIncluyeIVA) {
    const total = redondearMonto(monto);
    const iva = redondearMonto(total - total / (1 + factor));
    return { base: redondearMonto(total - iva), iva, total };
  }

  const base = redondearMonto(monto);
  const iva = redondearMonto(base * factor);
  return { base, iva, total: redondearMonto(base + iva) };
}

/**
 * Precio final que debe mostrarse al cliente en el POS.
 * Siempre es un precio con IVA incluido, tanto si se capturó como base y se le
 * sumó el impuesto como si se capturó directamente con impuesto incluido.
 */
export function precioFinal(
  precio: number,
  calcularIVA: boolean,
  porcentaje: number = TASA_IVA,
): number {
  return calcularIVA
    ? redondearMonto(precio * (1 + porcentaje / 100))
    : redondearMonto(precio);
}
