/**
 * Objeto de Transferencia de Datos (DTO) que representa la información
 * básica de una marca comercial dentro del catálogo de productos.
 */
export interface MarcaDTO {
  /**
   * El identificador único de la marca en la base de datos.
   */
  idMarca: string;

  /**
   * El nombre oficial de la marca (por ejemplo, "Sony", "Samsung", "Adidas").
   */
  nombre: string;
}
