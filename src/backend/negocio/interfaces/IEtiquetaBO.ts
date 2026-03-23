import { EtiquetaDTO } from "../DTOsSalida/ProductoDTOs";

export interface IEtiquetaBO {
  obtenerPorProducto(idProducto: string): Promise<EtiquetaDTO[]>;
  crear(etiqueta: EtiquetaDTO): Promise<EtiquetaDTO>;
  actualizar(etiqueta: EtiquetaDTO): Promise<EtiquetaDTO>;
  eliminar(id: string): Promise<boolean>;
  eliminarPorProducto(idProducto: string): Promise<boolean>;
}