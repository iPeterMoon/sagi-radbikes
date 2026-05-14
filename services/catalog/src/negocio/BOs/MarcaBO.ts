import { ICatalogoAccesoDatos } from "../../datos/daos/interfaces/ICatalogoAccesoDatos";
import { IMarcaBO } from "../interfaces/IMarcaBO";
import { MarcaDTO } from "../DTOsSalida";
import { MarcaMapper } from "../mappers/MarcaMapper";

/**
 * Business Object de marca de producto.
 * Gestiona las operaciones de la lógica de negocio y CRUD sobre las marcas del catálogo.
 */
export class MarcaBO implements IMarcaBO {
  /**
   * Constructor de la clase MarcaBO.
   *
   * @param accesoDatos Objeto centralizado que provee acceso a los distintos DAOs del catálogo.
   */
  constructor(private accesoDatos: ICatalogoAccesoDatos) {}

  /**
   * Recupera todas las marcas registradas en el sistema.
   *
   * @returns Un arreglo que contiene los DTOs de todas las marcas disponibles.
   */
  async obtenerTodas(): Promise<MarcaDTO[]> {
    const marcas = await this.accesoDatos.brandDAO.getAll();
    return marcas.map(MarcaMapper.toDTO);
  }

  /**
   * Busca y recupera una marca específica mediante su identificador.
   *
   * @param id El identificador único de la marca en formato de texto.
   * @returns El DTO de la marca encontrada, o nulo si no existe en la base de datos.
   */
  async obtenerPorId(id: string): Promise<MarcaDTO | null> {
    const marca = await this.accesoDatos.brandDAO.getById(BigInt(id));
    return marca ? MarcaMapper.toDTO(marca) : null;
  }

  /**
   * Crea y registra una nueva marca en el sistema.
   *
   * @param marca El objeto de transferencia de datos (DTO) con la información de la nueva marca.
   * @returns El DTO de la marca recién creada y persistida en la base de datos.
   */
  async crear(marca: MarcaDTO): Promise<MarcaDTO> {
    const entity = MarcaMapper.toEntity(marca);
    const created = await this.accesoDatos.brandDAO.create(entity as any);
    return MarcaMapper.toDTO(created);
  }

  /**
   * Modifica la información de una marca existente.
   *
   * @param marca El objeto de transferencia de datos (DTO) con los datos actualizados de la marca.
   * @returns El DTO de la marca con la información actualizada.
   */
  async actualizar(marca: MarcaDTO): Promise<MarcaDTO> {
    const entity = MarcaMapper.toEntity(marca);
    const updated = await this.accesoDatos.brandDAO.update(
      BigInt(marca.idMarca),
      entity as any,
    );
    return MarcaMapper.toDTO(updated);
  }

  /**
   * Elimina de manera permanente una marca del sistema.
   *
   * @param id El identificador único de la marca que se desea eliminar en formato de texto.
   * @returns Un valor booleano (verdadero) confirmando que la eliminación fue exitosa.
   */
  async eliminar(id: string): Promise<boolean> {
    await this.accesoDatos.brandDAO.delete(BigInt(id));
    return true;
  }
}
