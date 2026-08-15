/**
 * Objeto de Transferencia de Datos (DTO) de entrada utilizado para encapsular
 * la información necesaria al crear un nuevo atributo (clave-valor) y
 * asociarlo a una variante de producto específica.
 */
export interface CrearAtributoVarianteDTO {
  /**
   * El nombre o la clave que define el tipo de atributo (por ejemplo, "color", "talla", "material").
   */
  nombre: string;

  /**
   * El valor específico asignado al atributo (por ejemplo, "rojo", "M", "algodón").
   */
  valor: string;

  /**
   * El identificador único de la variante a la cual se vinculará este nuevo atributo.
   */
  idVariante: string;
}
