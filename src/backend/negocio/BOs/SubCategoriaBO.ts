import { IAccesoDatos } from "../../datos/IAccesoDatos";
import { ISubCategoriaBO } from "../interfaces/ISubCategoriaBO";
import { SubCategoriaDTO } from "../DTOsSalida/ProductoDTOs";
import { SubCategoriaMapper } from "../mappers/SubCategoriaMapper";

export class SubCategoriaBO implements ISubCategoriaBO {
  constructor(private accesoDatos: IAccesoDatos) {}

  async obtenerTodas(): Promise<SubCategoriaDTO[]> {
    const subCategorias = await this.accesoDatos.subCategoryDAO.getAll();
    return subCategorias.map(SubCategoriaMapper.toDTO);
  }

  async obtenerPorCategoria(idCategoria: string): Promise<SubCategoriaDTO[]> {
    const subCategorias = await this.accesoDatos.subCategoryDAO.getByCategory(BigInt(idCategoria));
    return subCategorias.map(SubCategoriaMapper.toDTO);
  }

  async obtenerPorId(id: string): Promise<SubCategoriaDTO | null> {
    const subCategoria = await this.accesoDatos.subCategoryDAO.getById(BigInt(id));
    return subCategoria ? SubCategoriaMapper.toDTO(subCategoria) : null;
  }

  async crear(subCategoria: SubCategoriaDTO): Promise<SubCategoriaDTO> {
    const entity = SubCategoriaMapper.toEntity(subCategoria);
    const created = await this.accesoDatos.subCategoryDAO.create(entity as any);
    return SubCategoriaMapper.toDTO(created);
  }

  async actualizar(subCategoria: SubCategoriaDTO): Promise<SubCategoriaDTO> {
    const entity = SubCategoriaMapper.toEntity(subCategoria);
    const updated = await this.accesoDatos.subCategoryDAO.update(BigInt(subCategoria.idSubCategoria), entity as any);
    return SubCategoriaMapper.toDTO(updated);
  }

  async eliminar(id: string): Promise<boolean> {
    await this.accesoDatos.subCategoryDAO.delete(BigInt(id));
    return true;
  }
}