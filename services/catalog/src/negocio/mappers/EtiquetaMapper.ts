import { product_physical } from "@prisma/client";
import { EtiquetaDTO } from "../DTOsSalida/ProductoDTOs";
import { CrearEtiquetaDTO } from "../DTOsEntrada/ProductoDTOs";

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
   * Convierte un CrearEtiquetaDTO a entidad Prisma parcial para creación.
   * @param dto - DTO de creación de etiqueta
   * @returns Entidad `product_physical` parcial
   */
  static toEntityFromCreate(dto: CrearEtiquetaDTO): Omit<product_physical, 'id'> {
    return {
      name: dto.nombre,
      value: dto.valor,
      product_id: BigInt(dto.idProducto),
      created_at: new Date(),
    };
  }

  static toEntity(dto: EtiquetaDTO): Omit<product_physical, 'id' | 'product_id' | 'created_at'> {
    return {
      name: dto.nombre,
      value: dto.valor,
    };
  }
}