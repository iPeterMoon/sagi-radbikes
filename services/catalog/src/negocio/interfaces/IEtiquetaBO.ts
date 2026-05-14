import { EtiquetaDTO } from "../DTOsSalida";
import { CrearEtiquetaDTO } from "../DTOsEntrada";

/**
 * Interfaz que define las operaciones de lógica de negocio para la gestión
 * de etiquetas (atributos dinámicos) asociadas a los productos.
 */
export interface IEtiquetaBO {
  /**
   * Recupera todas las etiquetas vinculadas a un producto específico.
   *
   * @param idProducto El identificador único del producto en formato string.
   * @returns Una promesa que resuelve a un arreglo con los DTOs de las etiquetas encontradas.
   */
  obtenerPorProducto(idProducto: string): Promise<EtiquetaDTO[]>;

  /**
   * Crea una nueva etiqueta y la asocia a un producto.
   *
   * @param etiqueta El objeto de transferencia de datos con la información necesaria para la creación.
   * @returns Una promesa que resuelve al DTO de la etiqueta recién creada.
   */
  crear(etiqueta: CrearEtiquetaDTO): Promise<EtiquetaDTO>;

  /**
   * Actualiza los datos de una etiqueta existente.
   *
   * @param etiqueta El objeto de transferencia con la información actualizada.
   * @returns Una promesa que resuelve al DTO de la etiqueta con los cambios aplicados.
   */
  actualizar(etiqueta: EtiquetaDTO): Promise<EtiquetaDTO>;

  /**
   * Elimina una etiqueta específica mediante su identificador.
   *
   * @param id El identificador único de la etiqueta que se desea eliminar.
   * @returns Una promesa que resuelve a un valor booleano indicando el éxito de la operación.
   */
  eliminar(id: string): Promise<boolean>;

  /**
   * Elimina de forma masiva todas las etiquetas pertenecientes a un producto.
   *
   * @param idProducto El identificador único del producto cuyas etiquetas serán borradas.
   * @returns Una promesa que resuelve a un valor booleano indicando el éxito de la operación.
   */
  eliminarPorProducto(idProducto: string): Promise<boolean>;
}
