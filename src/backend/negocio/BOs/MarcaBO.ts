import { IAccesoDatos } from "../../datos/IAccesoDatos";
import { IMarcaBO } from "../interfaces/IMarcaBO";
import { MarcaDTO } from "../DTOsSalida/ProductoDTOs";
import { MarcaMapper } from "../mappers/MarcaMapper";

/**
 * Business Object de marca de producto.
 * Gestiona las operaciones CRUD sobre las marcas del catálogo.
 */
export class MarcaBO implements IMarcaBO {
  constructor(private accesoDatos: IAccesoDatos) {}

  /** Obtiene todas las marcas registradas. */
  async obtenerTodas(): Promise<MarcaDTO[]> {
    const marcas = await this.accesoDatos.brandDAO.getAll();
    return marcas.map(MarcaMapper.toDTO);
  }

  async obtenerPorId(id: string): Promise<MarcaDTO | null> {
    const marca = await this.accesoDatos.brandDAO.getById(BigInt(id));
    return marca ? MarcaMapper.toDTO(marca) : null;
  }

  async crear(marca: MarcaDTO): Promise<MarcaDTO> {
    const entity = MarcaMapper.toEntity(marca);
    const created = await this.accesoDatos.brandDAO.create(entity as any);
    return MarcaMapper.toDTO(created);
  }

  async actualizar(marca: MarcaDTO): Promise<MarcaDTO> {
    const entity = MarcaMapper.toEntity(marca);
    const updated = await this.accesoDatos.brandDAO.update(BigInt(marca.idMarca), entity as any);
    return MarcaMapper.toDTO(updated);
  }

  async eliminar(id: string): Promise<boolean> {
    await this.accesoDatos.brandDAO.delete(BigInt(id));
    return true;
  }
}