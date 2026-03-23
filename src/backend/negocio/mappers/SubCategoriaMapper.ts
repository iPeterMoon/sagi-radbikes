import { subcategory } from "@prisma/client";
import { SubCategoriaDTO } from "../DTOsSalida/ProductoDTOs";

export class SubCategoriaMapper {
  static toDTO(entity: subcategory): SubCategoriaDTO {
    return {
      idSubCategoria: entity.id.toString(),
      nombre: entity.name || "",
      idCategoria: entity.category_id?.toString() || "",
    };
  }

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