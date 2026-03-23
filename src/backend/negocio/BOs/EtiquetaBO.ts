import { IAccesoDatos } from "../../datos/IAccesoDatos";
import { IEtiquetaBO } from "../interfaces/IEtiquetaBO";
import { EtiquetaDTO } from "../DTOsSalida/ProductoDTOs";
import { EtiquetaMapper } from "../mappers/EtiquetaMapper";

export class EtiquetaBO implements IEtiquetaBO {
  constructor(private accesoDatos: IAccesoDatos) {}

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

  async eliminarPorProducto(idProducto: string): Promise<boolean> {
    return await this.accesoDatos.labelDAO.deleteByProduct(BigInt(idProducto));
  }
}