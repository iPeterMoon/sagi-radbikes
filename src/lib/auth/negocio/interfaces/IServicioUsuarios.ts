import { NuevoUsuarioDTO } from "../DTOsEntrada/NuevoUsuarioDTO";
import { ActualizarUsuarioDTO } from "../DTOsEntrada/ActualizarUsuarioDTO";
import { UsuarioDTO } from "../DTOsSalida";
/**
 * Interfaz que define las operaciones del servicio de gestion de usuarios. Esta interfaz actúa como una fachada
 * que abstrae la lógica de la gestión de usuarios y roles, delegando en los objetos de negocio (BOs) las operaciones específicas.
 */
export interface IServicioUsuarios {

    /**
     * Recupera todos los usuarios registrados en el sistema.
     *
     * @returns Una promesa que resuelve a un arreglo con los DTOs de todos los usuarios.
     */
    obtenerTodos(): Promise<UsuarioDTO[]>;

    /**
     * Busca un usuario específico mediante su identificador único.
     *
     * @param id El identificador único del usuario en formato string.
     * @returns Una promesa que resuelve al DTO del usuario encontrado o nulo si no existe.
     */
    obtenerPorId(id: string): Promise<UsuarioDTO | null>;

    /**
     * Crea un nuevo usuario en el sistema con la contraseña proporcionada.
     * @param nuevoUsuario DTO con los datos del nuevo usuario a crear
     * @returns UsuarioDTO del usuario recién creado
     * @throws Error si el username o email ya existen en el sistema
     */
    crear(nuevoUsuario: NuevoUsuarioDTO): Promise<UsuarioDTO>;

    /**
     * Actualiza los datos de un usuario existente.
     * @param id Id del usuario a actualizar.
     * @param usuario DTO con los datos actualizados del usuario
     * @returns UsuarioDTO del usuario actualizado
     * @throws Error si el usuario no existe o si hay conflictos con username/email
     */
    actualizar(id: number | bigint, usuario: ActualizarUsuarioDTO): Promise<UsuarioDTO>;

    /**
     * Elimina un usuario del sistema.
     * @param id id del usuario a eliminar
     * @returns Promise<boolean> indicando si la operación fue exitosa
     */
    eliminar(id: number | bigint): Promise<boolean>;

    /**
     * Alterna el estado de actividad de un usuario (activo/inactivo).
     * @param id Id del usuario a alternar su estado de actividad
     * @returns true si se pudo alternar false si no
     */
    alternarActivo(id: number | bigint): Promise<boolean>;
}