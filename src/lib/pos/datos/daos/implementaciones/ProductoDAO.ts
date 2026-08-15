import { PrismaClient, product_variants } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IProductoDAO } from "../interfaces/IProductoDAO";

/**
 * Data Access Object para las Variantes de Producto (el "producto vendible" en el POS).
 */
export class ProductoDAO extends GenericDAO<product_variants> implements IProductoDAO {
  constructor(prisma: PrismaClient) {
    super(prisma, "product_variants");
  }

  /**
    * Obtiene todas las variantes que están marcadas como activas,
    * incluyendo sus relaciones (imágenes, atributos y producto padre con subcategoría).
    * @returns {Promise<product_variants[]>} Lista de variantes activas.
    */
  async getActivos(): Promise<product_variants[]> {
    return await this.db.findMany({
      where: { is_active: true },
      include: {
        product_images: true,
        product_variant_attributes: true,
        products: { include: { subcategory: true, product_images: true } },
      },
    });
  }

  /**
    * Busca una variante de manera exacta a través de su SKU.
    * @param {string} sku - Stock Keeping Unit de la variante.
    * @returns {Promise<product_variants | null>} La variante encontrada o nula.
    */
  async getBySKU(sku: string): Promise<product_variants | null> {
    return await this.db.findUnique({ where: { SKU: sku } });
  }

  /**
   * Busca una variante por su Código de Barras (UPC).
   * @param {string} codigo - Código de barras.
   * @returns {Promise<product_variants | null>} La variante encontrada o nula.
   */
  async getByCodigoBarras(codigo: string): Promise<product_variants | null> {
    return await this.db.findFirst({ where: { barcode_upc: codigo } });
  }

  /**
   * Disminuye de forma atómica la cantidad de stock disponible de una variante,
   * verificando en la misma operación que exista stock suficiente para evitar
   * que quede en negativo bajo ventas concurrentes.
   * @param {bigint} id - Identificador de la variante.
   * @param {number} cantidad - Unidades a descontar.
   * @returns {Promise<boolean>} Verdadero si había stock suficiente y se descontó.
   */
  async restarStock(id: bigint, cantidad: number): Promise<boolean> {
    const result = await this.prisma.product_variants.updateMany({
      where: { id, stock: { gte: cantidad } },
      data: { stock: { decrement: cantidad } },
    });
    return result.count > 0;
  }

  /**
     * Búsqueda flexible (Insensitive) por SKU de la variante o por el nombre del producto padre,
     * excluyendo las variantes inactivas.
     * @param {string} busqueda - Término a buscar.
     * @returns {Promise<product_variants[]>} Resultados que coinciden.
     */
  async buscarPorNombreOSKU(busqueda: string): Promise<product_variants[]> {
    return await this.db.findMany({
      where: {
        is_active: true,
        OR: [
          { SKU: { contains: busqueda, mode: "insensitive" } },
          { products: { name: { contains: busqueda, mode: "insensitive" } } },
        ],
      },
      include: {
        product_images: true,
        product_variant_attributes: true,
        products: { include: { subcategory: true, product_images: true } },
      },
    });
  }
}
