/**
 * Objeto de Transferencia de Datos (DTO) utilizado para actualizar la
 * configuración general del sistema.
 */
export interface ActualizarConfiguracionDTO {
  /**
   * El nuevo multiplicador sobre el costo para sugerir un precio de venta.
   */
  margenGananciaSugerido: number;
}
