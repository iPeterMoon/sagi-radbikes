import { PrismaClient, product_variants } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IProductVariantDAO } from "../interfaces/IProductVariantDAO";

/**
 * Implementación del Acceso a Datos (DAO) para la entidad de variantes de producto.
 * Extiende la funcionalidad genérica e interactúa con la base de datos a través de Prisma
 * para realizar consultas y gestión de inventario a nivel de variante (SKU, precio, stock).
 */
export class ProductVariantDAO extends GenericDAO<product_variants> implements IProductVariantDAO {
  /**
   * Inicializa una nueva instancia de ProductVariantDAO.
   *
   * @param prisma Instancia del cliente de Prisma para interactuar con la base de datos.
   */
  constructor(prisma: PrismaClient) {
    super(prisma, "product_variants");
  }

  /**
   * Obtiene todas las variantes de un producto, incluyendo sus atributos e imágenes.
   *
   * @param productId El identificador único numérico del producto.
   * @returns Una promesa que resuelve con un arreglo de entidades product_variants.
   */
  async getByProduct(productId: bigint): Promise<product_variants[]> {
    return await this.db.findMany({
      where: { product_id: productId },
      include: { product_variant_attributes: true, product_images: true },
    });
  }

  /**
   * Obtiene una lista de todas las variantes que se encuentran activas en el sistema.
   *
   * @returns Una promesa que resuelve con un arreglo de entidades product_variants.
   */
  async getActive(): Promise<product_variants[]> {
    return await this.db.findMany({
      where: { is_active: true },
    });
  }

  /**
   * Busca y obtiene una variante específica a partir de su SKU (Stock Keeping Unit).
   *
   * @param sku El código SKU único de la variante a buscar.
   * @returns Una promesa que resuelve con la entidad product_variants encontrada, o null si no existe.
   */
  async getBySKU(sku: string): Promise<product_variants | null> {
    return await this.db.findUnique({
      where: { SKU: sku },
    });
  }

  /**
   * Busca y obtiene una variante específica a partir de su código de barras.
   *
   * @param barcode El código de barras único de la variante.
   * @returns Una promesa que resuelve con la entidad product_variants encontrada, o null si no existe.
   */
  async getByBarcode(barcode: string): Promise<product_variants | null> {
    return await this.db.findFirst({
      where: { barcode_upc: barcode },
    });
  }

  /**
   * Obtiene una lista de variantes cuyo stock actual sea menor al umbral especificado.
   *
   * @param threshold El límite de cantidad en stock para realizar la búsqueda.
   * @returns Una promesa que resuelve con un arreglo de entidades product_variants.
   */
  async getBelowStock(threshold: number): Promise<product_variants[]> {
    return await this.db.findMany({
      where: { stock: { lt: threshold } },
    });
  }

  /**
   * Disminuye de forma atómica la cantidad en stock de una variante específica.
   * La condición de stock suficiente se evalúa como parte de la misma operación
   * de escritura (no con una lectura previa), evitando condiciones de carrera
   * bajo escrituras concurrentes.
   *
   * @param id El identificador único numérico de la variante.
   * @param quantity La cantidad a restar del stock actual.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  async decreaseStock(id: bigint, quantity: number): Promise<boolean> {
    const result = await this.db.updateMany({
      where: { id, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
    return result.count > 0;
  }

  /**
   * Aumenta de forma atómica la cantidad en stock de una variante específica.
   *
   * @param id El identificador único numérico de la variante.
   * @param quantity La cantidad a sumar al stock actual.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  async increaseStock(id: bigint, quantity: number): Promise<boolean> {
    const result = await this.db.updateMany({
      where: { id },
      data: { stock: { increment: quantity } },
    });
    return result.count > 0;
  }
}
