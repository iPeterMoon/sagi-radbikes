import { IAuthAccesoDatos } from "../datos/IAuthAccesoDatos";
import { RolDTO } from "./DTOsSalida";
import { NuevoRolDTO } from "./DTOsEntrada/NuevoRolDTO";
import { RolBO } from "./BOs/RolBO";
import { IRolBO } from "./interfaces/IRolBO";
import { IServicioRoles } from "./interfaces/IServicioRoles";

export class ServicioRoles implements IServicioRoles {
    private readonly rolBO: IRolBO;

    constructor(accesoDatos: IAuthAccesoDatos) {
        this.rolBO = new RolBO(accesoDatos);
    }

    /**
    * Crea un nuevo rol en el sistema.
    * @param nuevoRol DTO con los datos del nuevo rol a crear
    * @returns RolDTO del rol recién creado
    * @throws Error si el nombre del rol ya existe en el sistema
    */
    async crear(nuevoRol: NuevoRolDTO): Promise<RolDTO>{
        return await this.rolBO.crear(nuevoRol);
    }

    /**
     * Recupera todos los roles registrados en el sistema.
     *
     * @returns Una promesa que resuelve a un arreglo con los DTOs de todos los roles.
     */
    async obtenerTodos(): Promise<RolDTO[]>{
        return await this.rolBO.obtenerTodos();
    }

    /**
     * Busca un rol específico mediante su identificador único.
     *
     * @param id El identificador único del rol en formato string.
     * @returns Una promesa que resuelve al DTO del rol encontrado o nulo si no existe.
     */
    async obtenerPorId(id: string): Promise<RolDTO | null>{
        return await this.rolBO.obtenerPorId(id);
    }

    /**
     * Busca un rol específico mediante su nombre
     * @param nombre Nombre del rol que se desea buscar
     * @returns Una promesa que resuelve al DTO del rol encontrado o nulo si no existe.
     */
    async obtenerPorNombre(nombre: string): Promise<RolDTO | null>{
        return await this.rolBO.obtenerPorNombre(nombre);
    }

    /**
     * Actualiza un rol especifico mediante su identificador único.
     * @param id El identificador único del rol en formato string.
     * @param rol Datos del rol a actualizar
     * @returns Una promesa que resuelve al DTO del rol actualizado.
     * @throws Error si el rol no existe o si hay conflictos con el nombre del rol.
     */
    async actualizar(id: string, rol: RolDTO): Promise<RolDTO>{
        return await this.rolBO.actualizar(id, rol);
    }

    /**
     * Elimina un rol del sistema mediante su identificador
     * @param id Identificador único del rol a eliminar
     * @returns Promise<boolean> indicando si la operación fue exitosa
     * @throws Error si el rol no existe o si hay conflictos con el nombre del rol.
     */
    async eliminar(id: string): Promise<boolean>{
        return await this.rolBO.eliminar(id);
    }
}