import { roles } from "@prisma/client";
import { RolDTO } from "../DTOsSalida/RolDTO";

/**
 * Mapper de rol de usuario.
 * Convierte entre la entidad Prisma `roles` y el DTO `RolDTO`.
 */
export class RolMapper {
  /**
   * Convierte una entidad de rol a DTO.
   * @param entity - Entidad `roles` de Prisma
   * @returns RolDTO
   */
  static toDTO(entity: roles): RolDTO {
    return {
      idRol: entity.id,
      nombre: entity.name,
    };
  }

  /**
   * Convierte un RolDTO a entidad Prisma.
   * @param dto - DTO del rol
   * @returns Entidad `roles` completa
   */
  static toEntity(dto: RolDTO): roles {
    return {
      id: dto.idRol,
      created_at: new Date(),
      name: dto.nombre,
      description: null,
    };
  }

  /**
   * Convierte un array de entidades de rol a un array de DTOs.
   * @param entities - Lista de entidades `roles`
   * @returns Array de RolDTO
   */
  static toDTOArray(entities: roles[]): RolDTO[] {
    return entities.map((entity) => this.toDTO(entity));
  }
}