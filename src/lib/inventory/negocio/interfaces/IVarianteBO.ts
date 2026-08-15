import { VarianteDTO, AtributoVarianteDTO } from "../DTOsSalida";
import {
  CrearVarianteDTO,
  ActualizarVarianteDTO,
  CrearAtributoVarianteDTO,
} from "../DTOsEntrada";

/**
 * Interfaz que define las operaciones de lógica de negocio para la gestión
 * de variantes vendibles de producto (SKU, precio, stock y atributos).
 */
export interface IVarianteBO {
  /**
   * Recupera todas las variantes vinculadas a un producto específico.
   *
   * @param idProducto El identificador único del producto en formato string.
   * @returns Una promesa que resuelve a un arreglo con los DTOs de las variantes encontradas.
   */
  obtenerPorProducto(idProducto: string): Promise<VarianteDTO[]>;

  /**
   * Crea una nueva variante generando un SKU único automáticamente y la asocia a un producto.
   *
   * @param dto El objeto de transferencia de datos con la información necesaria para la creación.
   * @returns Una promesa que resuelve al DTO de la variante recién creada.
   */
  crear(dto: CrearVarianteDTO): Promise<VarianteDTO>;

  /**
   * Actualiza los datos de una variante existente, reemplazando sus atributos si se proveen.
   *
   * @param dto El objeto de transferencia con la información actualizada.
   * @returns Una promesa que resuelve al DTO de la variante con los cambios aplicados.
   */
  actualizar(dto: ActualizarVarianteDTO): Promise<VarianteDTO>;

  /**
   * Elimina una variante específica mediante su identificador.
   *
   * @param idVariante El identificador único de la variante que se desea eliminar.
   * @returns Una promesa que resuelve a un valor booleano indicando el éxito de la operación.
   */
  eliminar(idVariante: string): Promise<boolean>;

  /**
   * Ajusta el stock disponible de una variante sumando o restando una cantidad relativa al valor actual.
   *
   * @param idVariante El identificador único de la variante.
   * @param delta Cantidad a sumar (positiva) o restar (negativa) del stock actual.
   * @returns Una promesa que resuelve a un valor booleano indicando si el ajuste se pudo aplicar.
   */
  ajustarStock(idVariante: string, delta: number): Promise<boolean>;

  /**
   * Alterna el estado de activación de una variante (de activa a inactiva o viceversa).
   *
   * @param idVariante El identificador único de la variante.
   * @returns Una promesa que resuelve a un valor booleano indicando el éxito de la operación.
   */
  actualizarEstado(idVariante: string): Promise<boolean>;

  /**
   * Recupera todos los atributos vinculados a una variante específica.
   *
   * @param idVariante El identificador único de la variante en formato string.
   * @returns Una promesa que resuelve a un arreglo con los DTOs de los atributos encontrados.
   */
  obtenerAtributosPorVariante(idVariante: string): Promise<AtributoVarianteDTO[]>;

  /**
   * Crea un nuevo atributo y lo asocia a una variante.
   *
   * @param dto El objeto de transferencia de datos con la información necesaria para la creación.
   * @returns Una promesa que resuelve al DTO del atributo recién creado.
   */
  crearAtributo(dto: CrearAtributoVarianteDTO): Promise<AtributoVarianteDTO>;

  /**
   * Elimina un atributo específico mediante su identificador.
   *
   * @param idAtributo El identificador único del atributo que se desea eliminar.
   * @returns Una promesa que resuelve a un valor booleano indicando el éxito de la operación.
   */
  eliminarAtributo(idAtributo: string): Promise<boolean>;
}
