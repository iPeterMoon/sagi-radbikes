import { EtiquetaDTO } from "../DTOsSalida/ProductoDTOs";
import { CrearEtiquetaDTO } from "../DTOsEntrada/ProductoDTOs";

export interface IEtiquetaBO {
  obtenerPorProducto(idProducto: string): Promise<EtiquetaDTO[]>;
  crear(etiqueta: CrearEtiquetaDTO): Promise<EtiquetaDTO>;
  actualizar(etiqueta: EtiquetaDTO): Promise<EtiquetaDTO>;
  eliminar(id: string): Promise<boolean>;
  eliminarPorProducto(idProducto: string): Promise<boolean>;
}