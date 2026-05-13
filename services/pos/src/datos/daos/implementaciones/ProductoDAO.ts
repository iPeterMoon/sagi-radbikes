import { PrismaClient, products } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IProductoDAO } from "../interfaces/IProductoDAO";

/**
 * Data Access Object para la entidad de Productos.
 */
export class ProductoDAO extends GenericDAO<products> implements IProductoDAO {
  constructor(prisma: PrismaClient) {
    super(prisma, "products");
  }

  /**
    * Obtiene todos los productos que están marcados como activos,
    * incluyendo sus relaciones (imágenes y subcategoría).
    * @returns {Promise<products[]>} Lista de productos activos.
    */
  async getActivos(): Promise<products[]> {
    return await this.db.findMany({
      where: { is_active: true },
      include: { product_images: true, subcategory: true },
    });
  }

  /**
    * Busca un producto de manera exacta a través de su SKU.
    * @param {string} sku - Stock Keeping Unit del producto.
    * @returns {Promise<products | null>} El producto encontrado o nulo.
    */
  async getBySKU(sku: string): Promise<products | null> {
    return await this.db.findUnique({ where: { SKU: sku } });
  }

  /**
   * Busca un producto por su Código de Barras (UPC).
   * @param {string} codigo - Código de barras.
   * @returns {Promise<products | null>} El producto encontrado o nulo.
   */
  async getByCodigoBarras(codigo: string): Promise<products | null> {
    return await this.db.findFirst({ where: { barcode_upc: codigo } });
  }

  /**
   * Disminuye de forma atómica la cantidad de stock disponible de un producto.
   * @param {bigint} id - Identificador del producto.
   * @param {number} cantidad - Unidades a descontar.
   * @returns {Promise<boolean>} Verdadero si la operación es exitosa.
   */
  async restarStock(id: bigint, cantidad: number): Promise<boolean> {
    await this.prisma.products.update({
      where: { id },
      data: { stock: { decrement: cantidad } },
    });
    return true;
  }

  /**
     * Búsqueda flexible (Insensitive) por nombre de producto o por su SKU,
     * excluyendo los productos inactivos.
     * @param {string} busqueda - Término a buscar.
     * @returns {Promise<products[]>} Resultados que coinciden.
     */
  async buscarPorNombreOSKU(busqueda: string): Promise<products[]> {
    return await this.db.findMany({
      where: {
        is_active: true,
        OR: [
          { name: { contains: busqueda, mode: "insensitive" } },
          { SKU: { contains: busqueda, mode: "insensitive" } },
        ],
      },
      include: { product_images: true, subcategory: true },
    });
  }
}
