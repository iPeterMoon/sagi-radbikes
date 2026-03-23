import { categories } from "@prisma/client";
import { CategoriaDTO } from "../DTOsSalida/ProductoDTOs";

export class CategoriaMapper {
  static toDTO(entity: categories): CategoriaDTO {
    return {
      idCategoria: entity.id.toString(),
      nombre: entity.name || "",
      descripcion: entity.description || "",
    };
  }

  static toEntity(dto: CategoriaDTO): Partial<categories> {
    return {
      id: BigInt(dto.idCategoria),
      name: dto.nombre,
      description: dto.descripcion,
    };
  }
}