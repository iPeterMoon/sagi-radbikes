import { PrismaClient, products } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IProductDAO } from "../interfaces/IProductDAO";

/**
 * Implementación del Acceso a Datos (DAO) para la entidad de productos.
 * Extiende la funcionalidad genérica e interactúa con la base de datos a través de Prisma
 * para realizar consultas avanzadas de catálogo. El SKU, código de barras y stock
 * autoritativos se gestionan en `ProductVariantDAO`.
 */
export class ProductDAO extends GenericDAO<products> implements IProductDAO {
  /**
   * Inicializa una nueva instancia de ProductDAO.
   *
   * @param prisma Instancia del cliente de Prisma para interactuar con la base de datos.
   */
  constructor(prisma: PrismaClient) {
    super(prisma, "products");
  }

  /**
   * Obtiene una lista de productos que tienen al menos una variante cuyo stock
   * actual sea menor al umbral especificado (el producto ya no tiene stock propio).
   *
   * @param threshold El límite de cantidad en stock para realizar la búsqueda.
   * @returns Una promesa que resuelve con un arreglo de entidades products.
   */
  async getBelowStock(threshold: number): Promise<products[]> {
    return await this.db.findMany({
      where: { product_variants: { some: { stock: { lt: threshold } } } },
    });
  }

  /**
   * Obtiene una lista de productos que pertenecen a una categoría específica.
   *
   * @param categoryId El identificador único numérico de la categoría.
   * @returns Una promesa que resuelve con un arreglo de entidades products.
   */
  async getByCategory(categoryId: bigint): Promise<products[]> {
    return await this.db.findMany({
      where: { subcategory: { category_id: categoryId } },
    });
  }

  /**
   * Obtiene una lista de productos que pertenecen a una subcategoría específica.
   *
   * @param subCategoryId El identificador único numérico de la subcategoría.
   * @returns Una promesa que resuelve con un arreglo de entidades products.
   */
  async getBySubCategory(subCategoryId: bigint): Promise<products[]> {
    return await this.db.findMany({
      where: { subcategory_id: subCategoryId },
    });
  }

  /**
   * Obtiene una lista de productos que pertenecen a una marca específica.
   *
   * @param brandId El identificador único numérico de la marca.
   * @returns Una promesa que resuelve con un arreglo de entidades products.
   */
  async getByBrand(brandId: bigint): Promise<products[]> {
    return await this.db.findMany({
      where: { brand_id: brandId },
    });
  }

  /**
   * Obtiene una lista de todos los productos que se encuentran activos en el sistema.
   *
   * @returns Una promesa que resuelve con un arreglo de entidades products.
   */
  async getActive(): Promise<products[]> {
    return await this.db.findMany({
      where: { is_active: true },
    });
  }

  /**
   * Obtiene una lista de productos que coinciden con múltiples criterios de búsqueda opcionales,
   * incluyendo relaciones con imágenes, subcategorías, categorías, marcas, atributos físicos y variantes.
   * La búsqueda de texto libre también coincide con el SKU de cualquiera de las variantes del producto.
   *
   * @param search Término de búsqueda general (busca en nombre, descripción o SKU de variante).
   * @param categoryId El identificador de la categoría para filtrar, o null para omitir.
   * @param brandId El identificador de la marca para filtrar, o null para omitir.
   * @param minPrice El precio mínimo para filtrar, o null para omitir.
   * @param maxPrice El precio máximo para filtrar, o null para omitir.
   * @returns Una promesa que resuelve con un arreglo de entidades products filtradas.
   */
  async getByFilter(
    search: string,
    categoryId: bigint | null,
    brandId: bigint | null,
    minPrice: number | null,
    maxPrice: number | null,
  ): Promise<products[]> {
    return await this.db.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { description: { contains: search, mode: "insensitive" } },
                  {
                    product_variants: {
                      some: { SKU: { contains: search, mode: "insensitive" } },
                    },
                  },
                ],
              }
            : {},
          categoryId !== null
            ? { subcategory: { category_id: categoryId } }
            : {},
          brandId !== null ? { brand_id: brandId } : {},
          minPrice !== null ? { price: { gte: minPrice } } : {},
          maxPrice !== null ? { price: { lte: maxPrice } } : {},
        ],
      },
      include: {
        product_images: true,
        subcategory: {
          include: {
            categories: true,
          },
        },
        brands: true,
        product_physical: true,
        product_variants: {
          include: {
            product_variant_attributes: true,
            product_images: true,
          },
        },
      },
    });
  }
}
