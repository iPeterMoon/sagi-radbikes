import { SubCategoriaDTO } from "../DTOsSalida/ProductoDTOs";

export interface ISubCategoriaBO {
  obtenerTodas(): Promise<SubCategoriaDTO[]>;
  obtenerPorCategoria(idCategoria: string): Promise<SubCategoriaDTO[]>;
  obtenerPorId(id: string): Promise<SubCategoriaDTO | null>;
  crear(subCategoria: SubCategoriaDTO): Promise<SubCategoriaDTO>;
  actualizar(subCategoria: SubCategoriaDTO): Promise<SubCategoriaDTO>;
  eliminar(id: string): Promise<boolean>;
}