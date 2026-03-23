import { users, roles } from "@prisma/client";
import { UsuarioDTO } from "../DTOsSalida/UsuarioDTO";
import { RolMapper } from "./RolMapper";

export class UsuarioMapper {
  static toDTO(
    entity: users & { user_role?: Array<{ roles: roles }> }
  ): UsuarioDTO {
    const roles = entity.user_role?.map((ur) => ur.roles) || [];

    return {
      idUsuario: entity.id,
      username: entity.username || "",
      roles: RolMapper.toDTOArray(roles),
    };
  }

  static toEntity(dto: UsuarioDTO): users {
    return {
      id: dto.idUsuario,
      created_at: new Date(),
      username: dto.username,
      password: null,
    };
  }
}