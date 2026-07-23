import { ICatalogoAccesoDatos } from "../../datos/daos/interfaces/ICatalogoAccesoDatos";
import { ISubCategoriaBO } from "../interfaces/ISubCategoriaBO";
import { SubCategoriaDTO } from "../DTOsSalida";
import { SubCategoriaMapper } from "../mappers/SubCategoriaMapper";

/**
 * Business Object de subcategoría de producto.
 * Gestiona las operaciones de la lógica de negocio y CRUD sobre subcategorías,
 * que pertenecen a una categoría padre.
 */
export class SubCategoriaBO implements ISubCategoriaBO {
  /**
   * Constructor de la clase SubCategoriaBO.
   *
   * @param accesoDatos Objeto centralizado que provee acceso a los distintos DAOs del catálogo.
   */
  constructor(private accesoDatos: ICatalogoAccesoDatos) {}

  /**
   * Obtiene todas las subcategorías registradas en el sistema sin importar su categoría padre.
   *
   * @returns Un arreglo que contiene los DTOs de todas las subcategorías disponibles.
   */
  async obtenerTodas(): Promise<SubCategoriaDTO[]> {
    const subCategorias = await this.accesoDatos.subCategoryDAO.getAll();
    return subCategorias.map(SubCategoriaMapper.toDTO);
  }

  /**
   * Obtiene las subcategorías filtradas por la categoría padre a la que pertenecen.
   *
   * @param idCategoria El identificador único de la categoría padre en formato string.
   * @returns Un arreglo con los DTOs de las subcategorías vinculadas a la categoría padre.
   */
  async obtenerPorCategoria(idCategoria: string): Promise<SubCategoriaDTO[]> {
    const subCategorias = await this.accesoDatos.subCategoryDAO.getByCategory(
      BigInt(idCategoria),
    );
    return subCategorias.map(SubCategoriaMapper.toDTO);
  }

  /**
   * Busca y recupera una subcategoría específica mediante su identificador único.
   *
   * @param id El identificador único de la subcategoría en formato string.
   * @returns El DTO de la subcategoría encontrada, o nulo si no existe en la base de datos.
   */
  async obtenerPorId(id: string): Promise<SubCategoriaDTO | null> {
    const subCategoria = await this.accesoDatos.subCategoryDAO.getById(
      BigInt(id),
    );
    return subCategoria ? SubCategoriaMapper.toDTO(subCategoria) : null;
  }

  /**
   * Crea y registra una nueva subcategoría en el sistema.
   *
   * @param subCategoria El objeto de transferencia de datos (DTO) con la información de la nueva subcategoría.
   * @returns El DTO de la subcategoría recién creada y persistida.
   */
  async crear(subCategoria: SubCategoriaDTO): Promise<SubCategoriaDTO> {
    const entity = SubCategoriaMapper.toEntity(subCategoria);
    const created = await this.accesoDatos.subCategoryDAO.create(entity as any);
    return SubCategoriaMapper.toDTO(created);
  }

  /**
   * Modifica la información de una subcategoría previamente existente.
   *
   * @param subCategoria El objeto de transferencia de datos (DTO) con los datos actualizados de la subcategoría.
   * @returns El DTO de la subcategoría con la información actualizada.
   */
  async actualizar(subCategoria: SubCategoriaDTO): Promise<SubCategoriaDTO> {
    const entity = SubCategoriaMapper.toEntity(subCategoria);
    const updated = await this.accesoDatos.subCategoryDAO.update(
      BigInt(subCategoria.idSubCategoria),
      entity as any,
    );
    return SubCategoriaMapper.toDTO(updated);
  }

  /**
   * Elimina de manera permanente una subcategoría del sistema.
   *
   * @param id El identificador único de la subcategoría que se desea eliminar en formato string.
   * @returns Un valor booleano (verdadero) confirmando que la eliminación fue exitosa.
   */
  async eliminar(id: string): Promise<boolean> {
    await this.accesoDatos.subCategoryDAO.delete(BigInt(id));
    return true;
  }
}
