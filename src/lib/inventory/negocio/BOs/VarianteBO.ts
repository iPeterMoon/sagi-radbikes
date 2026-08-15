import { ICatalogoAccesoDatos } from "../../datos/daos/interfaces/ICatalogoAccesoDatos";
import { IVarianteBO } from "../interfaces/IVarianteBO";
import { VarianteDTO, AtributoVarianteDTO } from "../DTOsSalida";
import {
  CrearVarianteDTO,
  ActualizarVarianteDTO,
  CrearAtributoVarianteDTO,
} from "../DTOsEntrada";
import { VarianteMapper } from "../mappers/VarianteMapper";
import { AtributoVarianteMapper } from "../mappers/AtributoVarianteMapper";

/**
 * Business Object de variantes de producto.
 * Gestiona las operaciones de la lógica de negocio y CRUD sobre las variantes
 * vendibles (SKU, precio, stock) y sus atributos asociados.
 */
export class VarianteBO implements IVarianteBO {
  /**
   * Constructor de la clase VarianteBO.
   *
   * @param accesoDatos Objeto centralizado que provee acceso a los distintos DAOs del catálogo.
   */
  constructor(private accesoDatos: ICatalogoAccesoDatos) {}

  /**
   * Obtiene todas las variantes asociadas a un producto específico.
   *
   * @param idProducto El identificador único del producto propietario en formato de texto.
   * @returns Un arreglo que contiene los DTOs de las variantes correspondientes al producto.
   */
  async obtenerPorProducto(idProducto: string): Promise<VarianteDTO[]> {
    const variantes = await this.accesoDatos.variantDAO.getByProduct(
      BigInt(idProducto),
    );
    return variantes.map((v) => VarianteMapper.toDTO(v as any));
  }

  /**
   * Crea una nueva variante generando un SKU único automáticamente.
   * Si el DTO incluye atributos, los asocia a la variante creada.
   *
   * @param dto Datos de la nueva variante.
   * @returns El DTO de la variante recién creada y registrada.
   */
  async crear(dto: CrearVarianteDTO): Promise<VarianteDTO> {
    const sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const entity = {
      product_id: BigInt(dto.idProducto),
      SKU: sku,
      barcode_upc: dto.codigoDeBarras || null,
      price: dto.precio,
      stock: dto.stock,
      min_stock: dto.minStock ?? null,
      is_active: true,
    };
    const created = await this.accesoDatos.variantDAO.create(entity);

    if (dto.atributos) {
      for (const atributo of dto.atributos) {
        await this.accesoDatos.variantAttributeDAO.create({
          name: atributo.nombre,
          value: atributo.valor,
          variant_id: created.id,
        });
      }
    }

    return VarianteMapper.toDTO(created as any);
  }

  /**
   * Actualiza los datos de una variante existente.
   * Reemplaza completamente los atributos si se proveen en el DTO.
   *
   * @param dto Datos actualizados de la variante, incluyendo su ID.
   * @returns El DTO de la variante con su información actualizada.
   */
  async actualizar(dto: ActualizarVarianteDTO): Promise<VarianteDTO> {
    const entity = {
      barcode_upc: dto.codigoDeBarras || null,
      price: dto.precio,
      stock: dto.stock,
      min_stock: dto.minStock ?? null,
      ...(dto.activo !== undefined ? { is_active: dto.activo } : {}),
    };
    const updated = await this.accesoDatos.variantDAO.update(
      BigInt(dto.idVariante),
      entity,
    );

    if (dto.atributos) {
      await this.accesoDatos.variantAttributeDAO.deleteByVariant(
        BigInt(dto.idVariante),
      );
      for (const atributo of dto.atributos) {
        await this.accesoDatos.variantAttributeDAO.create({
          name: atributo.nombre,
          value: atributo.valor,
          variant_id: updated.id,
        });
      }
    }

    return VarianteMapper.toDTO(updated as any);
  }

  /**
   * Elimina de manera permanente una variante específica del sistema.
   *
   * @param idVariante El identificador único de la variante que se desea eliminar.
   * @returns Un valor booleano (verdadero) confirmando que la eliminación fue exitosa.
   */
  async eliminar(idVariante: string): Promise<boolean> {
    await this.accesoDatos.variantDAO.delete(BigInt(idVariante));
    return true;
  }

  /**
   * Ajusta el stock disponible de una variante sumando o restando una cantidad relativa
   * al valor actual (a diferencia de `actualizar`, que sobrescribe el stock con un valor absoluto).
   *
   * @param idVariante El identificador único de la variante.
   * @param delta Cantidad a sumar (positiva) o restar (negativa) del stock actual.
   * @returns Un valor booleano indicando si el ajuste se pudo aplicar (false si no había stock suficiente para restar).
   */
  async ajustarStock(idVariante: string, delta: number): Promise<boolean> {
    if (delta === 0) return true;
    const id = BigInt(idVariante);
    return delta < 0
      ? await this.accesoDatos.variantDAO.decreaseStock(id, -delta)
      : await this.accesoDatos.variantDAO.increaseStock(id, delta);
  }

  /**
   * Alterna el estado de activación de una variante (de activa a inactiva o viceversa).
   *
   * @param idVariante El identificador único de la variante.
   * @returns Un valor booleano confirmando si la actualización de estado fue exitosa.
   */
  async actualizarEstado(idVariante: string): Promise<boolean> {
    const variante = await this.accesoDatos.variantDAO.getById(
      BigInt(idVariante),
    );
    if (!variante) return false;
    await this.accesoDatos.variantDAO.update(BigInt(idVariante), {
      is_active: !variante.is_active,
    } as any);
    return true;
  }

  /**
   * Obtiene todos los atributos asociados a una variante específica.
   *
   * @param idVariante El identificador único de la variante propietaria en formato de texto.
   * @returns Un arreglo que contiene los DTOs de los atributos correspondientes a la variante.
   */
  async obtenerAtributosPorVariante(
    idVariante: string,
  ): Promise<AtributoVarianteDTO[]> {
    const atributos = await this.accesoDatos.variantAttributeDAO.getByVariant(
      BigInt(idVariante),
    );
    return atributos.map(AtributoVarianteMapper.toDTO);
  }

  /**
   * Crea y registra un nuevo atributo en el sistema.
   *
   * @param atributo El objeto de transferencia de datos (DTO) de entrada con la información para crear el atributo.
   * @returns El DTO del atributo recién creado y persistido en la base de datos.
   */
  async crearAtributo(
    atributo: CrearAtributoVarianteDTO,
  ): Promise<AtributoVarianteDTO> {
    const entity = AtributoVarianteMapper.toEntityFromCreate(atributo);
    const created = await this.accesoDatos.variantAttributeDAO.create(entity);
    return AtributoVarianteMapper.toDTO(created);
  }

  /**
   * Elimina de manera permanente un atributo específico del sistema.
   *
   * @param idAtributo El identificador único del atributo que se desea eliminar.
   * @returns Un valor booleano (verdadero) confirmando que la eliminación fue exitosa.
   */
  async eliminarAtributo(idAtributo: string): Promise<boolean> {
    await this.accesoDatos.variantAttributeDAO.delete(BigInt(idAtributo));
    return true;
  }
}
