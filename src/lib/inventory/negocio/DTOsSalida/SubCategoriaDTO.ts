/**
 * Objeto de Transferencia de Datos (DTO) que representa la información
 * de una subcategoría de producto y su relación jerárquica con una categoría padre.
 */
export interface SubCategoriaDTO {
  /**
   * El identificador único de la subcategoría en la base de datos.
   */
  idSubCategoria: string;

  /**
   * El nombre descriptivo de la subcategoría (por ejemplo, "Smartphones", "Cámaras DSLR").
   */
  nombre: string;

  /**
   * El identificador único de la categoría de nivel superior a la que pertenece esta subcategoría.
   */
  idCategoria: string;
}
