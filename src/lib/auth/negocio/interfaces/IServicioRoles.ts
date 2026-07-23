import { NuevoRolDTO } from "../DTOsEntrada/NuevoRolDTO";
import { RolDTO } from "../DTOsSalida/RolDTO";

/**
 * Interfaz que define las operaciones del servicio de gestion de roles. Esta interfaz actúa como una fachada
 * que abstrae la lógica de la gestión de roles, delegando en los objetos de negocio (BOs) las operaciones específicas.
 */
export interface IServicioRoles {
  /**
 * Crea un nuevo rol en el sistema.
 * @param nuevoRol DTO con los datos del nuevo rol a crear
 * @returns RolDTO del rol recién creado
 * @throws Error si el nombre del rol ya existe en el sistema
 */
  crear(nuevoRol: NuevoRolDTO): Promise<RolDTO>;

  /**
   * Recupera todos los roles registrados en el sistema.
   *
   * @returns Una promesa que resuelve a un arreglo con los DTOs de todos los roles.
   */
  obtenerTodos(): Promise<RolDTO[]>;

  /**
   * Busca un rol específico mediante su identificador único.
   *
   * @param id El identificador único del rol en formato string.
   * @returns Una promesa que resuelve al DTO del rol encontrado o nulo si no existe.
   */
  obtenerPorId(id: string): Promise<RolDTO | null>;

  /**
   * Busca un rol específico mediante su nombre
   * @param nombre Nombre del rol que se desea buscar
   * @returns Una promesa que resuelve al DTO del rol encontrado o nulo si no existe.
   */
  obtenerPorNombre(nombre: string): Promise<RolDTO | null>;

  /**
   * Actualiza un rol especifico mediante su identificador único.
   * @param id El identificador único del rol en formato string.
   * @param rol Datos del rol a actualizar
   * @returns Una promesa que resuelve al DTO del rol actualizado.
   * @throws Error si el rol no existe o si hay conflictos con el nombre del rol.
   */
  actualizar(id: string, rol: RolDTO): Promise<RolDTO>;

  /**
   * Elimina un rol del sistema mediante su identificador
   * @param id Identificador único del rol a eliminar
   * @returns Promise<boolean> indicando si la operación fue exitosa
   * @throws Error si el rol no existe o si hay conflictos con el nombre del rol.
   */
  eliminar(id: string): Promise<boolean>;
}