/**
 * Objeto de Transferencia de Datos (DTO) que define los criterios de búsqueda
 * y parámetros de filtrado para la consulta de productos en el catálogo.
 */
export interface FiltroProductoDTO {
  /**
   * Término de búsqueda libre para filtrar productos por coincidencia en
   * el nombre o en su código de unidad de mantenimiento de existencias (SKU).
   */
  busqueda: string;

  /**
   * El identificador único de la categoría para restringir la búsqueda a
   * una clasificación específica.
   */
  idCategoria: string;

  /**
   * El identificador único de la marca para filtrar productos de un
   * fabricante o proveedor determinado.
   */
  idMarca: string;

  /**
   * El estado actual del inventario basado en niveles predefinidos
   * (por ejemplo: "NORMAL", "BAJO", "CRITICO").
   */
  estadoStock: string;

  /**
   * El identificador único de la subcategoría para una búsqueda más
   * granulada dentro del catálogo.
   */
  idSubCategoria: string;

  /**
   * El límite inferior del rango de precio para los productos que se
   * desean consultar.
   */
  precioMin: number;

  /**
   * El límite superior del rango de precio para los productos que se
   * desean consultar.
   */
  precioMax: number;
}
