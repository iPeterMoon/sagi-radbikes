import { IAuthAccesoDatos } from "../datos/IAuthAccesoDatos";
import { NuevoUsuarioDTO } from "./DTOsEntrada/NuevoUsuarioDTO";
import { UsuarioDTO } from "./DTOsSalida";
import { IServicioUsuarios } from "./interfaces/IServicioUsuarios";
import { IUsuarioBO } from "./interfaces/IUsuarioBO";
import { UsuarioBO } from "./BOs/UsuarioBO";

/**
 * Servicio de inicio de sesión.
 * Actua como fachada delegando en {@link UsuarioBO} las operaciones en usuarios.
 */
export class ServicioUsuarios implements IServicioUsuarios {
    private readonly usuarioBO: IUsuarioBO;

    constructor(accesoDatos: IAuthAccesoDatos) {
        this.usuarioBO = new UsuarioBO(accesoDatos);
    }

    /**
     * Recupera todos los usuarios registrados en el sistema.
     *
     * @returns Una promesa que resuelve a un arreglo con los DTOs de todos los usuarios.
     */
    async obtenerTodos(): Promise<UsuarioDTO[]> {
        return await this.usuarioBO.obtenerTodos();
    }

    /**
     * Busca un usuario específico mediante su identificador único.
     *
     * @param id El identificador único del usuario en formato string.
     * @returns Una promesa que resuelve al DTO del usuario encontrado o nulo si no existe.
     */
    async obtenerPorId(id: string): Promise<UsuarioDTO | null> {
        return await this.usuarioBO.obtenerPorId(id);
    }


    /**
     * Crea un nuevo usuario en el sistema con la contraseña proporcionada.
     * @param nuevoUsuario DTO con los datos del nuevo usuario a crear
     * @returns UsuarioDTO del usuario recién creado
     * @throws Error si el username o email ya existen en el sistema
     */
    async crear(nuevoUsuario: NuevoUsuarioDTO): Promise<UsuarioDTO> {
        return await this.usuarioBO.crear(nuevoUsuario);
    }

    /**
     * Actualiza los datos de un usuario existente.
     * @param id Id del usuario a actualizar.
     * @param usuario DTO con los datos actualizados del usuario
     * @returns UsuarioDTO del usuario actualizado
     * @throws Error si el usuario no existe o si hay conflictos con username/email
     */
    async actualizar(id: number | bigint, usuario: UsuarioDTO): Promise<UsuarioDTO> {
        return await this.usuarioBO.actualizar(id, usuario);
    }

    /**
     * Elimina un usuario del sistema.
     * @param id id del usuario a eliminar
     * @returns Promise<boolean> indicando si la operación fue exitosa
     */
    async eliminar(id: number | bigint): Promise<boolean> {
        return await this.usuarioBO.eliminar(id);
    }

    /**
     * Alterna el estado de actividad de un usuario (activo/inactivo).
     * @param id Id del usuario a alternar su estado de actividad
     * @returns true si se pudo alternar false si no
     */
    async alternarActivo(id: number | bigint): Promise<boolean> {
        return await this.usuarioBO.alternarActivo(id);
    }
}
