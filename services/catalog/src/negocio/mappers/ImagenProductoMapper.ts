import { product_images } from "@prisma/client";
import { ImagenProductoDTO } from "../DTOsSalida/ProductoDTOs";

/**
 * Mapper de imagen de producto.
 * Convierte entre la entidad Prisma `product_images` y el DTO `ImagenProductoDTO`.
 */
export class ImagenProductoMapper {
  /**
   * Convierte una entidad de imagen a DTO.
   * @param entity - Entidad `product_images` de Prisma
   * @returns ImagenProductoDTO
   */
  static toDTO(entity: product_images): ImagenProductoDTO {
    return {
      idImagen: entity.id.toString(),
            url: entity.image_url || "",      esPrincipal: entity.is_main_image || false,
    };
  }

  /**
   * Convierte un ImagenProductoDTO a entidad Prisma parcial.
   * @param dto - DTO de la imagen
   * @returns Entidad `product_images` parcial
   */
  static toEntity(dto: ImagenProductoDTO): Partial<product_images> {
    return {
      id: BigInt(dto.idImagen),
      image_url: dto.url,
      is_main_image: dto.esPrincipal,
    };
  }
}