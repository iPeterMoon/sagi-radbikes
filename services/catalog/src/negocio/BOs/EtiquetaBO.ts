import { CatalogoAccesoDatos } from "../../datos/CatalogoAccesoDatos";
import { IEtiquetaBO } from "../interfaces/IEtiquetaBO";
import { EtiquetaDTO } from "../DTOsSalida";
import { CrearEtiquetaDTO } from "../DTOsEntrada";
import { EtiquetaMapper } from "../mappers/EtiquetaMapper";

/**
 * Business Object de etiquetas (atributos clave-valor) de producto.
 * Gestiona las operaciones de la lógica de negocio y CRUD sobre etiquetas asociadas a productos.
 */
export class EtiquetaBO implements IEtiquetaBO {
  /**
   * Constructor de la clase EtiquetaBO.
   *
   * @param accesoDatos Objeto centralizado que provee acceso a los distintos DAOs del catálogo.
   */
  constructor(private accesoDatos: CatalogoAccesoDatos) {}

  /**
   * Obtiene todas las etiquetas asociadas a un producto específico.
   *
   * @param idProducto El identificador único del producto propietario en formato de texto.
   * @returns Un arreglo que contiene los DTOs de las etiquetas correspondientes al producto.
   */
  async obtenerPorProducto(idProducto: string): Promise<EtiquetaDTO[]> {
    const etiquetas = await this.accesoDatos.labelDAO.getByProduct(
      BigInt(idProducto),
    );
    return etiquetas.map(EtiquetaMapper.toDTO);
  }

  /**
   * Crea y registra una nueva etiqueta en el sistema.
   *
   * @param etiqueta El objeto de transferencia de datos (DTO) de entrada con la información para crear la etiqueta.
   * @returns El DTO de la etiqueta recién creada y persistida en la base de datos.
   */
  async crear(etiqueta: CrearEtiquetaDTO): Promise<EtiquetaDTO> {
    const entity = EtiquetaMapper.toEntityFromCreate(etiqueta);
    const created = await this.accesoDatos.labelDAO.create(entity);
    return EtiquetaMapper.toDTO(created);
  }

  /**
   * Actualiza la información de una etiqueta previamente existente.
   *
   * @param etiqueta El objeto de transferencia de datos (DTO) con los datos modificados de la etiqueta.
   * @returns El DTO de la etiqueta con su información actualizada.
   */
  async actualizar(etiqueta: EtiquetaDTO): Promise<EtiquetaDTO> {
    const entity = EtiquetaMapper.toEntity(etiqueta);
    const updated = await this.accesoDatos.labelDAO.update(
      BigInt(etiqueta.idEtiqueta),
      entity,
    );
    return EtiquetaMapper.toDTO(updated);
  }

  /**
   * Elimina de manera permanente una etiqueta específica del sistema.
   *
   * @param id El identificador único de la etiqueta que se desea eliminar.
   * @returns Un valor booleano (verdadero) confirmando que la eliminación fue exitosa.
   */
  async eliminar(id: string): Promise<boolean> {
    await this.accesoDatos.labelDAO.delete(BigInt(id));
    return true;
  }

  /**
   * Elimina todas las etiquetas que se encuentran asociadas a un producto.
   * Útil antes de reemplazar el set de etiquetas completo en una actualización.
   *
   * @param idProducto El identificador único del producto cuyas etiquetas serán eliminadas.
   * @returns Un valor booleano (verdadero) confirmando que la eliminación masiva fue exitosa.
   */
  async eliminarPorProducto(idProducto: string): Promise<boolean> {
    return await this.accesoDatos.labelDAO.deleteByProduct(BigInt(idProducto));
  }
}
