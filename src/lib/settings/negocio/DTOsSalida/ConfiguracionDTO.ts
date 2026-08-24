/**
 * Objeto de Transferencia de Datos (DTO) que representa la configuración
 * general del sistema.
 */
export interface ConfiguracionDTO {
  /**
   * Multiplicador sobre el costo usado para sugerir un precio de venta
   * (ej. 1.5 = 50% de margen sobre el costo).
   */
  margenGananciaSugerido: number;
}
