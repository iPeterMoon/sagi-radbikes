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
    return {
      id: BigInt(dto.idMarca),
      name: dto.nombre,
    };
  }
}