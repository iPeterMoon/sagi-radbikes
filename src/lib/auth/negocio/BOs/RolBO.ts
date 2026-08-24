import { AuthAccesoDatos } from "../../datos/AuthAccesoDatos";
import { NuevoRolDTO } from "../DTOsEntrada/NuevoRolDTO";
import { RolDTO } from "../DTOsSalida/RolDTO";
import { IRolBO } from "../interfaces/IRolBO";
import { RolMapper } from "../mappers/RolMapper";

export class RolBO implements IRolBO {
    constructor(private accesoDatos: AuthAccesoDatos) { }

    /**
   * Crea un nuevo rol en el sistema.
   * @param nuevoRol DTO con los datos del nuevo rol a crear
   * @returns RolDTO del rol recién creado
   * @throws Error si el nombre del rol ya existe en el sistema
   */
    async crear(nuevoRol: NuevoRolDTO): Promise<RolDTO> {
        try {
            const existente = await this.accesoDatos.rolDAO.obtenerPorNombre(nuevoRol.nombre);

            if (existente) {
                throw new Error("Ya existe un rol con ese nombre");
            }

            const rol = await this.accesoDatos.rolDAO.create({
                name: nuevoRol.nombre,
                description: nuevoRol.descripcion,
            });

            for (const modulo of nuevoRol.modulos ?? []) {
                await this.accesoDatos.rolModuloDAO.create({
                    role_id: rol.id,
                    module: modulo,
                });
            }

            const rolConModulos = await this.accesoDatos.rolDAO.getByIdConModulos(rol.id);
            return RolMapper.toDTO(rolConModulos!);
        } catch (error) {
            throw new Error(`Error al crear un nuevo rol: ${error}`);
        }
    }

    /**
     * Recupera todos los roles registrados en el sistema.
     *
     * @returns Una promesa que resuelve a un arreglo con los DTOs de todos los roles.
     */
    async obtenerTodos(): Promise<RolDTO[]> {
        const roles = await this.accesoDatos.rolDAO.getAllConModulos();
        return roles.map((rol) => (RolMapper.toDTO(rol)));
    }

    /**
     * Busca un rol específico mediante su identificador único.
     *
     * @param id El identificador único del rol en formato string.
     * @returns Una promesa que resuelve al DTO del rol encontrado o nulo si no existe.
     */
    async obtenerPorId(id: string): Promise<RolDTO | null> {
        const rol = await this.accesoDatos.rolDAO.getByIdConModulos(BigInt(id));
        return rol ? RolMapper.toDTO(rol) : null;
    }

    /**
   * Busca un rol específico mediante su nombre
   * @param nombre Nombre del rol que se desea buscar
   * @returns Una promesa que resuelve al DTO del rol encontrado o nulo si no existe.
   */
    async obtenerPorNombre(nombre: string): Promise<RolDTO | null> {
        const rol = await this.accesoDatos.rolDAO.obtenerPorNombre(nombre);
        return rol ? RolMapper.toDTO(rol) : null;
    }


    /**
     * Actualiza un rol especifico mediante su identificador único.
     * @param id El identificador único del rol en formato string.
     * @param rol Datos del rol a actualizar
     * @returns Una promesa que resuelve al DTO del rol actualizado.
     * @throws Error si el rol no existe o si hay conflictos con el nombre del rol.
     */
    async actualizar(id: string, rol: RolDTO): Promise<RolDTO> {
        try {
            const existente = await this.accesoDatos.rolDAO.getById(BigInt(id));
            if (!existente) {
                throw new Error("El rol que desea editar no existe");
            }
            if (rol.nombre !== existente.name) {
                const rolNombre = await this.accesoDatos.rolDAO.obtenerPorNombre(rol.nombre);
                if (rolNombre) {
                    throw new Error("Ya existe un rol con este nombre");
                }
            }

            const accesosActuales = await this.accesoDatos.rolModuloDAO.getByRoleId(BigInt(id));
            const modulosActuales = accesosActuales.map((acceso) => acceso.module);
            const modulosNuevos = rol.modulos ?? [];

            const modulosAgregar = modulosNuevos.filter((m) => !modulosActuales.includes(m));
            const modulosQuitar = modulosActuales.filter((m) => !modulosNuevos.includes(m));

            for (const modulo of modulosAgregar) {
                await this.accesoDatos.rolModuloDAO.create({
                    role_id: BigInt(id),
                    module: modulo,
                });
            }

            for (const modulo of modulosQuitar) {
                const accesoId = accesosActuales.find((acceso) => acceso.module === modulo)?.id;
                await this.accesoDatos.rolModuloDAO.delete(accesoId!);
            }

            await this.accesoDatos.rolDAO.update(BigInt(id), {
                name: rol.nombre,
                description: rol.descripcion,
            });

            const rolConModulos = await this.accesoDatos.rolDAO.getByIdConModulos(BigInt(id));
            return RolMapper.toDTO(rolConModulos!);

        } catch (error) {
            throw new Error(`Error al actualizar al rol: ${error}`);
        }
    }

    /**
     * Elimina un rol del sistema mediante su identificador
     * @param id Identificador único del rol a eliminar
     * @returns Promise<boolean> indicando si la operación fue exitosa
     * @throws Error si el rol no existe o si hay conflictos con el nombre del rol.
     */
    async eliminar(id: string): Promise<boolean> {
        try {
            const existente = this.accesoDatos.rolDAO.getById(BigInt(id));
            if (!existente) {
                throw new Error("El rol ya está eliminado o no existe");
            }

            await this.accesoDatos.rolDAO.delete(BigInt(id))

            return true;
        } catch (error) {
            throw new Error(`Error al eliminar al rol ${error}`);
        }
    }
}
