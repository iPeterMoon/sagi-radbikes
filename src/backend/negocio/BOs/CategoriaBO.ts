import { IAccesoDatos } from "../../datos/IAccesoDatos";
import { ICategoriaBO } from "../interfaces/ICategoriaBO";
import { CategoriaDTO } from "../DTOsSalida/ProductoDTOs";
import { CategoriaMapper } from "../mappers/CategoriaMapper";

/**
 * Business Object de categoría de producto.
 * Gestiona las operaciones CRUD sobre las categorías del catálogo.
 */
export class CategoriaBO implements ICategoriaBO {
  constructor(private accesoDatos: IAccesoDatos) {}

  /** Obtiene todas las categorías registradas. */
  async obtenerTodas(): Promise<CategoriaDTO[]> {
    const categorias = await this.accesoDatos.categoryDAO.getAll();
    return categorias.map(CategoriaMapper.toDTO);
  }

  async obtenerPorId(id: string): Promise<CategoriaDTO | null> {
    const categoria = await this.accesoDatos.categoryDAO.getById(BigInt(id));
    return categoria ? CategoriaMapper.toDTO(categoria) : null;
  }

  /** Crea una nueva categoría a partir de su DTO. */
  async crear(categoria: CategoriaDTO): Promise<CategoriaDTO> {
    const entity = CategoriaMapper.toEntity(categoria);
    const created = await this.accesoDatos.categoryDAO.create(entity as any);
    return CategoriaMapper.toDTO(created);
  }

  async actualizar(categoria: CategoriaDTO): Promise<CategoriaDTO> {
    const entity = CategoriaMapper.toEntity(categoria);
    const updated = await this.accesoDatos.categoryDAO.update(BigInt(categoria.idCategoria), entity as any);
    return CategoriaMapper.toDTO(updated);
  }

  async eliminar(id: string): Promise<boolean> {
    await this.accesoDatos.categoryDAO.delete(BigInt(id));
    return true;
  }
}