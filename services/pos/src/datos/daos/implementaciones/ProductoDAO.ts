import { PrismaClient, products } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IProductoDAO } from "../interfaces/IProductoDAO";

export class ProductoDAO extends GenericDAO<products> implements IProductoDAO {
  constructor(prisma: PrismaClient) {
    super(prisma, "products");
  }

  async getActivos(): Promise<products[]> {
    return await this.db.findMany({
      where: { is_active: true },
      include: { product_images: true, subcategory: true },
    });
  }

  async getBySKU(sku: string): Promise<products | null> {
    return await this.db.findUnique({ where: { SKU: sku } });
  }

  async getByCodigoBarras(codigo: string): Promise<products | null> {
    return await this.db.findFirst({ where: { barcode_upc: codigo } });
  }

  async restarStock(id: bigint, cantidad: number): Promise<boolean> {
    await this.prisma.products.update({
      where: { id },
      data: { stock: { decrement: cantidad } },
    });
    return true;
  }

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
