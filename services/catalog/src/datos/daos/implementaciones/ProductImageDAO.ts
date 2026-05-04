import { PrismaClient, product_images } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { IProductImageDAO } from "../interfaces/IProductImageDAO";

export class ProductImageDAO implements IProductImageDAO {
  private readonly db: PrismaClient["product_images"];
  private readonly prisma: PrismaClient;
  private readonly supabase: SupabaseClient;

  private readonly BUCKET_NAME =
    process.env.SUPABASE_BUCKET_IMAGES || "product-images";

  constructor(prisma: PrismaClient, supabase: SupabaseClient) {
    this.db = prisma.product_images;
    this.prisma = prisma;
    this.supabase = supabase;
  }

  async create(
    img: File,
    productId: bigint,
    isMain: boolean = false,
  ): Promise<product_images> {
    const fileName = `${productId}/${Date.now()}_${img.name}`;

    const { error: uploadError } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, img);

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = this.supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(fileName);

    // If this image should be the main image, unset other main images first
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

  async getById(id: bigint): Promise<product_images | null> {
    return await this.db.findUnique({ where: { id } });
  }

  async delete(id: bigint): Promise<product_images> {
    const image = await this.db.findUnique({ where: { id } });
    if (!image) throw new Error(`Image with id ${id} not found`);

    if (image.image_url) {
      const path = image.image_url.split(`${this.BUCKET_NAME}/`)[1];
      await this.supabase.storage.from(this.BUCKET_NAME).remove([path]);
    }

    return await this.db.delete({ where: { id } });
  }

  async getByProduct(productId: bigint): Promise<product_images[]> {
    return await this.db.findMany({
      where: { product_id: productId },
    });
  }

  async getMainByProduct(productId: bigint): Promise<product_images | null> {
    return await this.db.findFirst({
      where: { product_id: productId, is_main_image: true },
    });
  }

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
