/**
 * Objeto de Transferencia de Datos (DTO) que representa la información
 * detallada de una categoría de productos dentro del sistema.
 */
export interface CategoriaDTO {
  /**
   * El identificador único de la categoría, utilizado para referencias en la base de datos.
   */
  idCategoria: string;

  /**
   * El nombre descriptivo de la categoría (por ejemplo, "Electrónica", "Línea Blanca").
   */
  nombre: string;

  /**
   * Una descripción opcional que detalla el propósito o los tipos de productos que abarca la categoría.
   */
  descripcion: string;
}
