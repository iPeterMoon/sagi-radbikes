import { product_physical } from "@prisma/client";
import { EtiquetaDTO } from "../DTOsSalida/ProductoDTOs";

/**
 * Mapper de etiqueta (atributo físico) de producto.
 * Convierte entre la entidad Prisma `product_physical` y el DTO `EtiquetaDTO`.
 */
export class EtiquetaMapper {
  /**
   * Convierte una entidad de atributo físico a EtiquetaDTO.
   * @param entity - Entidad `product_physical` de Prisma
   * @returns EtiquetaDTO
   */
  static toDTO(entity: product_physical): EtiquetaDTO {
    return {
      idEtiqueta: entity.id.toString(),
      nombre: entity.name || "",
      valor: entity.value || "",
    };
  }

  /**
   * Convierte un EtiquetaDTO a entidad Prisma parcial.
   * @param dto - DTO de la etiqueta
   * @returns Entidad `product_physical` parcial
   */
  static toEntity(dto: EtiquetaDTO): Partial<product_physical> {
    return {
      id: BigInt(dto.idEtiqueta),
      name: dto.nombre,
      value: dto.valor,
    };
  }
}