import { users, roles } from "@prisma/client";
import { UsuarioDTO } from "../DTOsSalida/UsuarioDTO";
import { RolMapper } from "./RolMapper";

/**
 * Mapper de usuario.
 * Convierte entre la entidad Prisma `users` y el DTO público `UsuarioDTO`.
 */
export class UsuarioMapper {
  /**
   * Convierte una entidad de usuario (con sus roles) a DTO.
   * @param entity - Entidad `users` con relación `user_role` incluida
   * @returns UsuarioDTO sin datos sensibles
   */
  static toDTO(
    entity: users & { user_role?: Array<{ roles: roles | null}> }
  ): UsuarioDTO {

    const rolesFiltrados = entity.user_role
      ?.map((ur) => ur.roles)
      .filter((rol) => rol !== null) || []
    return {
      idUsuario: String(entity.id),
      username: entity.username || "",
      nombre: entity.nombre || "",
      apellido: entity.apellido || "",
      email: entity.email || "",
      telefono: entity.telefono || "",
      is_active: entity.is_active,
      roles: RolMapper.toDTOArray(rolesFiltrados as any),
    };
  }

  /**
   * Convierte un UsuarioDTO de vuelta a entidad Prisma.
   * Nota: la entidad resultante no contiene la contraseña.
   * @param dto - DTO del usuario
   * @returns Entidad `users` parcial
   */
  static toEntity(dto: UsuarioDTO): users {
    return {
      id: BigInt(dto.idUsuario),
      created_at: new Date(),
      username: dto.username,
      nombre: dto.nombre || "",
      apellido: dto.apellido || "",
      email: dto.email || "",
      telefono: dto.telefono || "",
      is_active: dto.is_active,
      password: null,
    };
  }
}