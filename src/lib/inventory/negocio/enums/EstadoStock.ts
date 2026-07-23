/**
 * Enumeración que define los posibles estados de inventario de un producto
 * en función de su disponibilidad y niveles de stock mínimo.
 */
export enum EstadoStock {
  /** Indica que el nivel de existencias es suficiente y se encuentra por encima del umbral de alerta. */
  NORMAL = "NORMAL",

  /** Indica que el nivel de existencias se aproxima al stock mínimo y requiere atención para reabastecimiento. */
  BAJO = "BAJO",

  /** Indica que el nivel de existencias es extremadamente bajo o nulo, requiriendo acción inmediata. */
  CRITICO = "CRITICO",
}
