/**
 * Objeto de Transferencia de Datos (DTO) de entrada utilizado para encapsular
 * la información necesaria al crear una nueva etiqueta (atributo clave-valor)
 * y asociarla a un producto específico.
 */
export interface CrearEtiquetaDTO {
  /**
   * El nombre o la clave que define el tipo de atributo (por ejemplo, "color", "talla", "material").
   */
  nombre: string;

  /**
   * El valor específico asignado al atributo de la etiqueta (por ejemplo, "rojo", "M", "algodón").
   */
  valor: string;

  /**
   * El identificador único del producto al cual se vinculará esta nueva etiqueta.
   */
  idProducto: string;
}
