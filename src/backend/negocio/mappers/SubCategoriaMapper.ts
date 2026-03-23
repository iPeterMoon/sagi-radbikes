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
    return {
      id: BigInt(dto.idSubCategoria),
      name: dto.nombre,
      category_id: BigInt(dto.idCategoria),
    };
  }
}