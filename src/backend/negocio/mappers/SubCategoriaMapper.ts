import { subcategory } from "@prisma/client";
import { SubCategoriaDTO } from "../DTOsSalida/ProductoDTOs";

/**
 * Mapper de subcategoría de producto.
 * Convierte entre la entidad Prisma `subcategory` y el DTO `SubCategoriaDTO`.
 */
export class SubCategoriaMapper {
  /**
   * Convierte una entidad de subcategoría a DTO.
   * @param entity - Entidad `subcategory` de Prisma
   * @returns SubCategoriaDTO
   */
  static toDTO(entity: subcategory): SubCategoriaDTO {
    return {
      idSubCategoria: entity.id.toString(),
      nombre: entity.name || "",
      idCategoria: entity.category_id?.toString() || "",
    };
  }

  /**
   * Convierte un SubCategoriaDTO a entidad Prisma parcial.
   * Si el DTO no tiene ID, la entidad resultante tampoco lo incluye.
   * @param dto - DTO de la subcategoría
   * @returns Entidad `subcategory` parcial
   */
  static toEntity(dto: SubCategoriaDTO): Partial<subcategory> {
    const entity: Partial<subcategory> = {
      name: dto.nombre,
      category_id: BigInt(dto.idCategoria),
    };

    if (dto.idSubCategoria) {
      entity.id = BigInt(dto.idSubCategoria);
    }

    return entity;
  }
}