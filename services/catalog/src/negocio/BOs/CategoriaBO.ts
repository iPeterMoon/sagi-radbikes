import { CatalogoAccesoDatos } from "../../datos/CatalogoAccesoDatos";
import { ICategoriaBO } from "../interfaces/ICategoriaBO";
import { CategoriaDTO } from "../DTOsSalida";
import { CategoriaMapper } from "../mappers/CategoriaMapper";

/**
 * Business Object de categoría de producto.
 * Gestiona las operaciones de la lógica de negocio y CRUD sobre las categorías del catálogo.
 */
export class CategoriaBO implements ICategoriaBO {
  /**
   * Constructor de la clase CategoriaBO.
   *
   * @param accesoDatos Objeto centralizado que provee acceso a los distintos DAOs del catálogo.
   */
  constructor(private accesoDatos: CatalogoAccesoDatos) {}

  /**
   * Recupera todas las categorías registradas en el sistema.
   *
   * @returns Un arreglo que contiene los DTOs de todas las categorías disponibles.
   */
  async obtenerTodas(): Promise<CategoriaDTO[]> {
    const categorias = await this.accesoDatos.categoryDAO.getAll();
    return categorias.map(CategoriaMapper.toDTO);
  }

  /**
   * Busca y recupera una categoría específica mediante su identificador.
   *
   * @param id El identificador único de la categoría en formato de texto.
   * @returns El DTO de la categoría encontrada, o nulo si no existe en la base de datos.
   */
  async obtenerPorId(id: string): Promise<CategoriaDTO | null> {
    const categoria = await this.accesoDatos.categoryDAO.getById(BigInt(id));
    return categoria ? CategoriaMapper.toDTO(categoria) : null;
  }

  /**
   * Crea y registra una nueva categoría en el sistema.
   *
   * @param categoria El objeto de transferencia de datos (DTO) con la información de la nueva categoría.
   * @returns El DTO de la categoría recién creada y persistida.
   */
  async crear(categoria: CategoriaDTO): Promise<CategoriaDTO> {
    const entity = CategoriaMapper.toEntity(categoria);
    const created = await this.accesoDatos.categoryDAO.create(entity as any);
    return CategoriaMapper.toDTO(created);
  }

  /**
   * Modifica la información de una categoría existente.
   *
   * @param categoria El objeto de transferencia de datos (DTO) con los datos actualizados de la categoría.
   * @returns El DTO de la categoría con la información actualizada.
   */
  async actualizar(categoria: CategoriaDTO): Promise<CategoriaDTO> {
    const entity = CategoriaMapper.toEntity(categoria);
    const updated = await this.accesoDatos.categoryDAO.update(
      BigInt(categoria.idCategoria),
      entity as any,
    );
    return CategoriaMapper.toDTO(updated);
  }

  /**
   * Elimina de manera permanente una categoría del sistema.
   *
   * @param id El identificador único de la categoría que se desea eliminar en formato de texto.
   * @returns Un valor booleano (verdadero) confirmando que la eliminación fue exitosa.
   */
  async eliminar(id: string): Promise<boolean> {
    await this.accesoDatos.categoryDAO.delete(BigInt(id));
    return true;
  }
}
