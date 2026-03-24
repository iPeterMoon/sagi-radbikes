import { product_images } from "@prisma/client";
import { ImagenProductoDTO } from "../DTOsSalida/ProductoDTOs";

export class ImagenProductoMapper {
  static toDTO(entity: product_images): ImagenProductoDTO {
    return {
      idImagen: entity.id.toString(),
            url: entity.image_url || "",      esPrincipal: entity.is_main_image || false,
    };
  }

  static toEntity(dto: ImagenProductoDTO): Partial<product_images> {
    return {
      id: BigInt(dto.idImagen),
      image_url: dto.url,
      is_main_image: dto.esPrincipal,
    };
  }
}