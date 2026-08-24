import { roles, role_module_access } from "@prisma/client";
import { RolDTO } from "../DTOsSalida/RolDTO";

/** Entidad `roles` con sus accesos a módulos incluidos (opcional). */
type RolEntity = roles & { role_module_access?: role_module_access[] };

/**
 * Mapper de rol de usuario.
 * Convierte entre la entidad Prisma `roles` y el DTO `RolDTO`.
 */
export class RolMapper {
  /**
   * Convierte una entidad de rol a DTO. Si la entidad no trae
   * `role_module_access` incluido, `modulos` queda vacío.
   * @param entity - Entidad `roles` de Prisma
   * @returns RolDTO
   */
  static toDTO(entity: RolEntity): RolDTO {
    return {
      idRol: String(entity.id),
      nombre: entity.name,
      descripcion: entity.description,
      modulos: (entity.role_module_access ?? []).map((acceso) => acceso.module),
    };
  }

  /**
   * Convierte un RolDTO a entidad Prisma.
   * @param dto - DTO del rol
   * @returns Entidad `roles` completa
   */
  static toEntity(dto: RolDTO): roles {
    return {
      id: BigInt(dto.idRol),
      created_at: new Date(),
      name: dto.nombre,
      description: dto.descripcion,
    };
  }

  /**
   * Convierte un array de entidades de rol a un array de DTOs.
   * @param entities - Lista de entidades `roles`
   * @returns Array de RolDTO
   */
  static toDTOArray(entities: RolEntity[]): RolDTO[] {
    return entities.map((entity) => this.toDTO(entity));
  }
}