import { IAccesoDatos } from "../../datos/IAccesoDatos";
import { IEtiquetaBO } from "../interfaces/IEtiquetaBO";
import { EtiquetaDTO } from "../DTOsSalida/ProductoDTOs";
import { EtiquetaMapper } from "../mappers/EtiquetaMapper";

/**
 * Business Object de etiquetas (atributos clave-valor) de producto.
 * Gestiona las operaciones CRUD sobre etiquetas asociadas a productos.
 */
export class EtiquetaBO implements IEtiquetaBO {
  constructor(private accesoDatos: IAccesoDatos) {}

  /**
   * Obtiene todas las etiquetas de un producto específico.
   * @param idProducto - ID del producto propietario
   */
  async obtenerPorProducto(idProducto: string): Promise<EtiquetaDTO[]> {
    const etiquetas = await this.accesoDatos.labelDAO.getByProduct(BigInt(idProducto));
    return etiquetas.map(EtiquetaMapper.toDTO);
  }

  async crear(etiqueta: EtiquetaDTO): Promise<EtiquetaDTO> {
    const entity = EtiquetaMapper.toEntity(etiqueta);
    const created = await this.accesoDatos.labelDAO.create(entity as any);
    return EtiquetaMapper.toDTO(created);
  }

  async actualizar(etiqueta: EtiquetaDTO): Promise<EtiquetaDTO> {
    const entity = EtiquetaMapper.toEntity(etiqueta);
    const updated = await this.accesoDatos.labelDAO.update(BigInt(etiqueta.idEtiqueta), entity as any);
    return EtiquetaMapper.toDTO(updated);
  }

  async eliminar(id: string): Promise<boolean> {
    await this.accesoDatos.labelDAO.delete(BigInt(id));
    return true;
  }

  /**
   * Elimina todas las etiquetas asociadas a un producto.
   * Útil antes de reemplazar el set de etiquetas en una actualización.
   * @param idProducto - ID del producto cuyas etiquetas se eliminan
   */
  async eliminarPorProducto(idProducto: string): Promise<boolean> {
    return await this.accesoDatos.labelDAO.deleteByProduct(BigInt(idProducto));
  }
}