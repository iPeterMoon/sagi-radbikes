import { brands } from "@prisma/client";
import { MarcaDTO } from "../DTOsSalida/ProductoDTOs";

/**
 * Mapper de marca de producto.
 * Convierte entre la entidad Prisma `brands` y el DTO `MarcaDTO`.
 */
export class MarcaMapper {
  /**
   * Convierte una entidad de marca a DTO.
   * @param entity - Entidad `brands` de Prisma
   * @returns MarcaDTO
   */
  static toDTO(entity: brands): MarcaDTO {
    return {
      idMarca: entity.id.toString(),
      nombre: entity.name || "",
    };
  }

  /**
   * Convierte un MarcaDTO a entidad Prisma parcial.
   * @param dto - DTO de la marca
   * @returns Entidad `brands` parcial
   */
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