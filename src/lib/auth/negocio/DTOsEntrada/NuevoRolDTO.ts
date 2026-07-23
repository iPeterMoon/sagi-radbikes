/** Datos de un rol de usuario a crear*/
export interface NuevoRolDTO {
    /** Nombre descriptivo del rol (ej. "admin", "cajero"). */
    nombre: string;
    /** Descripción del rol y sus permisos asociados. */
    descripcion: string;
}