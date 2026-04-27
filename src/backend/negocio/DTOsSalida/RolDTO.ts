/** Datos de un rol de usuario. */
export interface RolDTO {
  /** Identificador único del rol (BigInt porque el esquema Prisma lo requiere). */
  idRol: bigint;
  /** Nombre descriptivo del rol (ej. "admin", "cajero"). */
  nombre: string;
}