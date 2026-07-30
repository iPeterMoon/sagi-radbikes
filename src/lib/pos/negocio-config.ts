/**
 * Datos fiscales y de contacto del negocio, usados para encabezado del ticket.
 * Persona física con actividad empresarial (no persona moral).
 */
export const NEGOCIO_CONFIG = {
  nombre: "RAD Bikes",
  titular: "Pedro Luna Lopez",
  rfc: "LULP710629UL6",
  direccionLineas: [
    "Calle Vicente Guerrero 1004-Pte.",
    "Col. del Valle, 85120",
    "Cd. Obregón, Son"
  ],
  telefono: "644 169 7420",
} as const;