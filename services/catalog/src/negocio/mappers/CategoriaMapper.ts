import { categories } from "@prisma/client";
import { CategoriaDTO } from "../DTOsSalida/ProductoDTOs";

/**
 * Mapper de categoría.
 * Convierte entre la entidad Prisma `categories` y el DTO `CategoriaDTO`.
 */
export class CategoriaMapper {
  /**
   * Convierte una entidad de categoría a DTO.
   * @param entity - Entidad `categories` de Prisma
   * @returns CategoriaDTO
   */
  static toDTO(entity: categories): CategoriaDTO {
    return {
      idCategoria: entity.id.toString(),
      nombre: entity.name || "",
      descripcion: entity.description || "",
    };
  }

  /**
   * Convierte un CategoriaDTO a entidad Prisma parcial.
   * Si el DTO no tiene ID, la entidad resultante tampoco lo incluye.
   * @param dto - DTO de la categoría
   * @returns Entidad `categories` parcial
   */
  static toEntity(dto: CategoriaDTO): Partial<categories> {
    const entity: Partial<categories> = {
      name: dto.nombre,
      description: dto.descripcion,
    };

    if (dto.idCategoria) {
      entity.id = BigInt(dto.idCategoria);
    }

    return entity;
  }
}