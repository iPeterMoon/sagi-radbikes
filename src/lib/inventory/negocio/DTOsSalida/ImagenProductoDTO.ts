/**
 * Objeto de Transferencia de Datos (DTO) que representa la información
 * de una imagen vinculada a un producto en el sistema.
 */
export interface ImagenProductoDTO {
  /**
   * El identificador único de la imagen en la base de datos.
   */
  idImagen: string;

  /**
   * La dirección URL pública para acceder al archivo de imagen almacenado.
   */
  url: string;

  /**
   * Determina si esta imagen ha sido designada como la vista principal o
   * portada del producto en el catálogo.
   */
  esPrincipal: boolean;
}
