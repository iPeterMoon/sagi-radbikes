import { PrismaClient, product_images } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { IProductImageDAO } from "../interfaces/IProductImageDAO";

/**
 * Implementación del Acceso a Datos (DAO) para las imágenes de los productos.
 * Gestiona el almacenamiento físico de las imágenes en Supabase Storage y
 * sus respectivos metadatos en la base de datos a través de Prisma.
 */
export class ProductImageDAO implements IProductImageDAO {
  private readonly db: PrismaClient["product_images"];
  private readonly prisma: PrismaClient;
  private readonly supabase: SupabaseClient;

  private readonly BUCKET_NAME =
    process.env.SUPABASE_BUCKET_IMAGES || "product-images";

  /**
   * Inicializa una nueva instancia de ProductImageDAO.
   *
   * @param prisma Instancia del cliente de Prisma para interactuar con la base de datos.
   * @param supabase Instancia del cliente de Supabase para interactuar con el almacenamiento (Storage).
   */
  constructor(prisma: PrismaClient, supabase: SupabaseClient) {
    this.db = prisma.product_images;
    this.prisma = prisma;
    this.supabase = supabase;
  }

  /**
   * Normaliza el nombre de un archivo eliminando acentos, caracteres especiales y espacios.
   *
   * @param name El nombre original del archivo.
   * @returns El nombre del archivo normalizado.
   */
  private normalizeFileName(name: string): string {
    const extensionMatch = name.match(/\.[^/.]+$/);
    const extension = extensionMatch ? extensionMatch[0].toLowerCase() : "";
    const baseName = name
      .replace(extension, "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toLowerCase();

    return `${baseName}${extension}`;
  }

  /**
   * Genera un nombre de archivo único para evitar colisiones en el almacenamiento.
   *
   * @param img El archivo de imagen proporcionado por Multer.
   * @param productId El identificador del producto asociado.
   * @returns Una cadena con la ruta y el nombre único del archivo.
   */
  private getUniqueFileName(
    img: File,
    productId: bigint,
  ): string {
    const safeName = this.normalizeFileName(img.name || "image");
    const randomId =
      typeof globalThis !== "undefined" &&
        typeof (globalThis as any).crypto?.randomUUID === "function"
        ? (globalThis as any).crypto.randomUUID()
        : Math.random().toString(36).substring(2, 10);

    return `${productId}/${Date.now()}-${randomId}_${safeName}`;
  }

  /**
   * Crea un nuevo registro de imagen, subiendo el archivo a Supabase Storage
   * y guardando la referencia en la base de datos.
   *
   * @param img El archivo de imagen a subir.
   * @param productId El identificador único numérico del producto.
   * @param isMain Indica si la imagen debe ser establecida como la principal del producto.
   * @returns Una promesa que resuelve con la entidad product_images creada.
   * @throws Error si ocurre un problema al subir la imagen a Supabase.
   */
  async create(
    img: File,
    productId: bigint,
    isMain: boolean = false,
  ): Promise<product_images> {
    const fileName = this.getUniqueFileName(img, productId);

    const { error: uploadError } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .upload(
        fileName,
        Buffer.from(await img.arrayBuffer()),
        {
          contentType: img.type,
        }
      );

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = this.supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(fileName);

    if (isMain) {
      await this.db.updateMany({
        where: { product_id: productId, is_main_image: true },
        data: { is_main_image: false },
      });
    }

    return await this.db.create({
      data: {
        product_id: productId,
        image_url: urlData.publicUrl,
        is_main_image: isMain,
      },
    });
  }

  /**
   * Obtiene el registro de una imagen por su identificador.
   *
   * @param id El identificador único numérico de la imagen.
   * @returns Una promesa que resuelve con la entidad product_images, o null si no se encuentra.
   */
  async getById(id: bigint): Promise<product_images | null> {
    return await this.db.findUnique({ where: { id } });
  }

  /**
   * Elimina una imagen, removiéndola tanto del almacenamiento en Supabase como de la base de datos.
   *
   * @param id El identificador único numérico de la imagen a eliminar.
   * @returns Una promesa que resuelve con la entidad product_images eliminada.
   * @throws Error si la imagen no existe en la base de datos.
   */
  async delete(id: bigint): Promise<product_images> {
    const image = await this.db.findUnique({ where: { id } });
    if (!image) throw new Error(`Image with id ${id} not found`);

    if (image.image_url) {
      const path = image.image_url.split(`${this.BUCKET_NAME}/`)[1];
      await this.supabase.storage.from(this.BUCKET_NAME).remove([path]);
    }

    return await this.db.delete({ where: { id } });
  }

  /**
   * Obtiene todas las imágenes asociadas a un producto.
   *
   * @param productId El identificador único numérico del producto.
   * @returns Una promesa que resuelve con un arreglo de entidades product_images.
   */
  async getByProduct(productId: bigint): Promise<product_images[]> {
    return await this.db.findMany({
      where: { product_id: productId },
    });
  }

  /**
   * Obtiene la imagen principal de un producto.
   *
   * @param productId El identificador único numérico del producto.
   * @returns Una promesa que resuelve con la entidad product_images principal, o null si no existe.
   */
  async getMainByProduct(productId: bigint): Promise<product_images | null> {
    return await this.db.findFirst({
      where: { product_id: productId, is_main_image: true },
    });
  }

  /**
   * Establece una imagen existente como la principal de su producto,
   * desmarcando previamente cualquier otra imagen principal que tuviera el producto.
   *
   * @param id El identificador único numérico de la imagen.
   * @returns Una promesa que resuelve con true si la operación fue exitosa, o false en caso contrario.
   */
  async setMain(id: bigint): Promise<boolean> {
    try {
      const image = await this.db.findUnique({ where: { id } });
      if (!image) return false;

      await this.db.updateMany({
        where: { product_id: image.product_id, is_main_image: true },
        data: { is_main_image: false },
      });

      await this.db.update({
        where: { id },
        data: { is_main_image: true },
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Elimina todas las imágenes de un producto, removiendo los archivos físicos
   * de Supabase y los registros de la base de datos.
   *
   * @param productId El identificador único numérico del producto.
   * @returns Una promesa que resuelve con true si la eliminación masiva fue exitosa, o false en caso de error.
   */
  async deleteByProduct(productId: bigint): Promise<boolean> {
    try {
      const images = await this.db.findMany({
        where: { product_id: productId },
      });

      const paths = images
        .filter((img: product_images) => img.image_url)
        .map(
          (img: product_images) =>
            img.image_url!.split(`${this.BUCKET_NAME}/`)[1],
        );

      if (paths.length > 0) {
        await this.supabase.storage.from(this.BUCKET_NAME).remove(paths);
      }

      await this.db.deleteMany({ where: { product_id: productId } });

      return true;
    } catch {
      return false;
    }
  }
}
