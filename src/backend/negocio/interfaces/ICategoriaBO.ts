import { CategoriaDTO } from "../DTOsSalida/ProductoDTOs";

export interface ICategoriaBO {
  obtenerTodas(): Promise<CategoriaDTO[]>;
  obtenerPorId(id: string): Promise<CategoriaDTO | null>;
  crear(categoria: CategoriaDTO): Promise<CategoriaDTO>;
  actualizar(categoria: CategoriaDTO): Promise<CategoriaDTO>;
  eliminar(id: string): Promise<boolean>;
}