import { product_physical } from "@prisma/client";
import { EtiquetaDTO } from "../DTOsSalida/ProductoDTOs";

export class EtiquetaMapper {
  static toDTO(entity: product_physical): EtiquetaDTO {
    return {
      idEtiqueta: entity.id.toString(),
      nombre: entity.name || "",
      valor: entity.value || "",
    };
  }

  static toEntity(dto: EtiquetaDTO): Partial<product_physical> {
    return {
      id: BigInt(dto.idEtiqueta),
      name: dto.nombre,
      value: dto.valor,
    };
  }
}