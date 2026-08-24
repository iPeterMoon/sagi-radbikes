/**
 * Objeto de Transferencia de Datos (DTO) que encapsula la información requerida
 * para crear una nueva variante de un producto existente. El SKU no se incluye
 * aquí porque se autogenera al momento de la creación.
 */
export interface CrearVarianteDTO {
  /**
   * El identificador único del producto al cual pertenecerá la nueva variante.
   */
  idProducto: string;

  /**
   * El precio de venta de la nueva variante.
   */
  precio: number;

  /**
   * El costo de compra de la nueva variante, usado para calcular márgenes.
   */
  costo?: number;

  /**
   * La cantidad de unidades iniciales disponibles en el inventario para esta variante.
   */
  stock: number;

  /**
   * El límite mínimo de existencias antes de requerir reabastecimiento.
   * `null` o `undefined` desactiva las notificaciones de stock bajo para esta variante.
   */
  minStock?: number | null;

  /**
   * El código de barras universal (UPC) opcional de la variante.
   */
  codigoDeBarras?: string;

  /**
   * Una colección opcional de atributos clave-valor que describen a la variante (ej. color, talla).
   */
  atributos?: { nombre: string; valor: string }[];
}
