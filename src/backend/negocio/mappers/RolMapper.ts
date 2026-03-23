import { roles } from "@prisma/client";
import { RolDTO } from "../DTOsSalida/RolDTO";

export class RolMapper {
  static toDTO(entity: roles): RolDTO {
    return {
      idRol: entity.id,
      nombre: entity.name,
    };
  }

  static toEntity(dto: RolDTO): roles {
    return {
      id: dto.idRol,
      created_at: new Date(),
      name: dto.nombre,
      description: null,
    };
  }

  static toDTOArray(entities: roles[]): RolDTO[] {
    return entities.map((entity) => this.toDTO(entity));
  }
}