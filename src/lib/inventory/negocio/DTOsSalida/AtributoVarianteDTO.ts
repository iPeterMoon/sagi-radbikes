/**
 * Objeto de Transferencia de Datos (DTO) que representa un atributo
 * complementario de una variante de producto en formato clave-valor.
 */
export interface AtributoVarianteDTO {
  /**
   * El identificador único del atributo en la base de datos.
   */
  idAtributo: string;

  /**
   * El nombre o clave que define el tipo de atributo (por ejemplo, "color", "talla").
   */
  nombre: string;

  /**
   * El valor específico asignado al atributo (por ejemplo, "azul", "Grande").
   */
  valor: string;
}
