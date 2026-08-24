/**
 * Objeto de Transferencia de Datos (DTO) utilizado para encapsular la información
 * necesaria al actualizar los datos de una variante de producto existente.
 */
export interface ActualizarVarianteDTO {
  /**
   * El identificador único de la variante que se va a actualizar.
   */
  idVariante: string;

  /**
   * El nuevo precio de venta de la variante.
   */
  precio: number;

  /**
   * El nuevo costo de compra de la variante.
   */
  costo?: number;

  /**
   * La nueva cantidad de unidades disponibles en el inventario.
   */
  stock: number;

  /**
   * El límite mínimo de existencias antes de requerir reabastecimiento.
   * `null` o `undefined` desactiva las notificaciones de stock bajo para esta variante.
   */
  minStock?: number | null;

  /**
   * El código de barras universal (UPC) de la variante.
   */
  codigoDeBarras?: string;

  /**
   * El nuevo estado de activación de la variante.
   */
  activo?: boolean;

  /**
   * La nueva lista de atributos clave-valor que reemplazará al conjunto
   * de atributos actualmente asociados a la variante.
   */
  atributos?: { nombre: string; valor: string }[];
}
