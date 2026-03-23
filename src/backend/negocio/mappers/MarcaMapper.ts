import { brands } from "@prisma/client";
import { MarcaDTO } from "../DTOsSalida/ProductoDTOs";

export class MarcaMapper {
  static toDTO(entity: brands): MarcaDTO {
    return {
      idMarca: entity.id.toString(),
      nombre: entity.name || "",
    };
  }

  static toEntity(dto: MarcaDTO): Partial<brands> {
    const entity: Partial<brands> = {
      name: dto.nombre,
    };

    if (dto.idMarca) {
      entity.id = BigInt(dto.idMarca);
    }

    return entity;
  }
}