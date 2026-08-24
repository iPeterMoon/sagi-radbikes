/** Datos de un rol de usuario. */
export interface RolDTO {
  /** Identificador único del rol (BigInt porque el esquema Prisma lo requiere). */
  idRol: string;
  /** Nombre descriptivo del rol (ej. "admin", "cajero"). */
  nombre: string;
  /** Descripción del rol y sus permisos asociados. */
  descripcion: string | null;
  /** Ids de los módulos de la app a los que da acceso este rol (ej. "catalogo", "reportes"). */
  modulos: string[];
}
