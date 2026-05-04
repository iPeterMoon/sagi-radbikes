import { MarcaDTO } from "../DTOsSalida/ProductoDTOs";

export interface IMarcaBO {
  obtenerTodas(): Promise<MarcaDTO[]>;
  obtenerPorId(id: string): Promise<MarcaDTO | null>;
  crear(marca: MarcaDTO): Promise<MarcaDTO>;
  actualizar(marca: MarcaDTO): Promise<MarcaDTO>;
  eliminar(id: string): Promise<boolean>;
}