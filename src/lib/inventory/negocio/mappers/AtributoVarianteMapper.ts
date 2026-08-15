import { product_variant_attributes } from "@prisma/client";
import { AtributoVarianteDTO } from "../DTOsSalida";
import { CrearAtributoVarianteDTO } from "../DTOsEntrada";

/**
 * Mapper de atributo de variante de producto.
 * Convierte entre la entidad Prisma `product_variant_attributes` y el DTO `AtributoVarianteDTO`.
 */
export class AtributoVarianteMapper {
  /**
   * Convierte una entidad de atributo de variante a AtributoVarianteDTO.
   * @param entity - Entidad `product_variant_attributes` de Prisma
   * @returns AtributoVarianteDTO
   */
  static toDTO(entity: product_variant_attributes): AtributoVarianteDTO {
    return {
      idAtributo: entity.id.toString(),
      nombre: entity.name || "",
      valor: entity.value || "",
    };
  }

  /**
   * Convierte un CrearAtributoVarianteDTO a entidad Prisma parcial para creación.
   * @param dto - DTO de creación del atributo de variante
   * @returns Entidad `product_variant_attributes` parcial
   */
  static toEntityFromCreate(dto: CrearAtributoVarianteDTO): Omit<product_variant_attributes, 'id'> {
    return {
      name: dto.nombre,
      value: dto.valor,
      variant_id: BigInt(dto.idVariante),
      created_at: new Date(),
    };
  }

  static toEntity(dto: AtributoVarianteDTO): Omit<product_variant_attributes, 'id' | 'variant_id' | 'created_at'> {
    return {
      name: dto.nombre,
      value: dto.valor,
    };
  }
}
