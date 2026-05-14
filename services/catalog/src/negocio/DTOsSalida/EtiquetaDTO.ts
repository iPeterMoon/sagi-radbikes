/**
 * Objeto de Transferencia de Datos (DTO) que representa un atributo
 * complementario de un producto en formato clave-valor.
 */
export interface EtiquetaDTO {
  /**
   * El identificador único de la etiqueta en la base de datos.
   */
  idEtiqueta: string;

  /**
   * El nombre o clave que define el tipo de atributo (por ejemplo, "color", "talla").
   */
  nombre: string;

  /**
   * El valor específico asignado al atributo (por ejemplo, "azul", "Grande").
   */
  valor: string;
}
