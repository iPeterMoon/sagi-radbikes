import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoryDAO } from "@/lib/inventory/datos/daos/implementaciones/CategoryDAO";
import { BrandDAO } from "@/lib/inventory/datos/daos/implementaciones/BrandDAO";
import { SubCategoryDAO } from "@/lib/inventory/datos/daos/implementaciones/SubCategoryDAO";
import { ProductDAO } from "@/lib/inventory/datos/daos/implementaciones/ProductDAO";
import { ProductVariantDAO } from "@/lib/inventory/datos/daos/implementaciones/ProductVariantDAO";
import { LabelDAO } from "@/lib/inventory/datos/daos/implementaciones/LabelDAO";
import { VariantAttributeDAO } from "@/lib/inventory/datos/daos/implementaciones/VariantAttributeDAO";
import { ProductImageDAO } from "@/lib/inventory/datos/daos/implementaciones/ProductImageDAO";
import { prismaDelegateMock } from "../../helpers/mocks";

/* eslint-disable @typescript-eslint/no-explicit-any */

function prismaWith(...models: string[]) {
  const prisma: any = {};
  for (const model of models) prisma[model] = prismaDelegateMock();
  return prisma;
}

describe("GenericDAO (inventario)", () => {
  let delegate: any;
  let dao: CategoryDAO;

  beforeEach(() => {
    delegate = prismaDelegateMock();
    dao = new CategoryDAO({ categories: delegate } as any);
  });

  it("getAll pasa el include a findMany", async () => {
    delegate.findMany.mockResolvedValue([{ id: 1n }]);
    await expect(dao.getAll({ x: true })).resolves.toEqual([{ id: 1n }]);
    expect(delegate.findMany).toHaveBeenCalledWith({ include: { x: true } });
  });

  it("getById usa findUnique por id", async () => {
    delegate.findUnique.mockResolvedValue(null);
    await expect(dao.getById(5n)).resolves.toBeNull();
    expect(delegate.findUnique).toHaveBeenCalledWith({ where: { id: 5n }, include: undefined });
  });

  it("create, update y delete delegan en el delegado", async () => {
    delegate.create.mockResolvedValue({ id: 1n });
    delegate.update.mockResolvedValue({ id: 1n });
    delegate.delete.mockResolvedValue({ id: 1n });

    await dao.create({ name: "C" } as any);
    await dao.update(1n, { name: "U" } as any);
    await dao.delete(1n);

    expect(delegate.create).toHaveBeenCalledWith({ data: { name: "C" } });
    expect(delegate.update).toHaveBeenCalledWith({ where: { id: 1n }, data: { name: "U" } });
    expect(delegate.delete).toHaveBeenCalledWith({ where: { id: 1n } });
  });

  it("getByName busca de forma insensible a mayúsculas", async () => {
    delegate.findFirst.mockResolvedValue({ id: 1n, name: "Componentes" });
    await dao.getByName("componentes");
    expect(delegate.findFirst).toHaveBeenCalledWith({
      where: { name: { equals: "componentes", mode: "insensitive" } },
    });
  });
});

describe("BrandDAO / SubCategoryDAO", () => {
  it("BrandDAO.getByName es insensible a mayúsculas", async () => {
    const delegate = prismaDelegateMock();
    const dao = new BrandDAO({ brands: delegate } as any);
    delegate.findFirst.mockResolvedValue(null);
    await dao.getByName("Shimano");
    expect(delegate.findFirst).toHaveBeenCalledWith({
      where: { name: { equals: "Shimano", mode: "insensitive" } },
    });
  });

  it("SubCategoryDAO filtra por categoría", async () => {
    const delegate = prismaDelegateMock();
    const dao = new SubCategoryDAO({ subcategory: delegate } as any);
    delegate.findMany.mockResolvedValue([]);
    await dao.getByCategory(3n);
    expect(delegate.findMany).toHaveBeenCalledWith({ where: { category_id: 3n } });
  });
});

describe("ProductDAO", () => {
  let delegate: any;
  let dao: ProductDAO;

  beforeEach(() => {
    delegate = prismaDelegateMock();
    dao = new ProductDAO({ products: delegate } as any);
  });

  it("getBelowStock filtra variantes por debajo del umbral", async () => {
    delegate.findMany.mockResolvedValue([]);
    await dao.getBelowStock(5);
    expect(delegate.findMany).toHaveBeenCalledWith({
      where: { product_variants: { some: { stock: { lt: 5 } } } },
    });
  });

  it("getByCategory, getBySubCategory y getByBrand filtran por id", async () => {
    delegate.findMany.mockResolvedValue([]);
    await dao.getByCategory(1n);
    await dao.getBySubCategory(2n);
    await dao.getByBrand(3n);
    expect(delegate.findMany).toHaveBeenNthCalledWith(1, {
      where: { subcategory: { category_id: 1n } },
    });
    expect(delegate.findMany).toHaveBeenNthCalledWith(2, { where: { subcategory_id: 2n } });
    expect(delegate.findMany).toHaveBeenNthCalledWith(3, { where: { brand_id: 3n } });
  });

  it("getActive filtra por is_active", async () => {
    delegate.findMany.mockResolvedValue([]);
    await dao.getActive();
    expect(delegate.findMany).toHaveBeenCalledWith({ where: { is_active: true } });
  });

  it("getByFilter arma la consulta con búsqueda, categoría, marca y precios", async () => {
    delegate.findMany.mockResolvedValue([]);
    await dao.getByFilter("bici", 1n, 2n, 10, 20);

    const arg = delegate.findMany.mock.calls[0][0];
    expect(arg.where.AND[0]).toEqual({
      OR: [
        { name: { contains: "bici", mode: "insensitive" } },
        { description: { contains: "bici", mode: "insensitive" } },
        { product_variants: { some: { SKU: { contains: "bici", mode: "insensitive" } } } },
      ],
    });
    expect(arg.where.AND[1]).toEqual({ subcategory: { category_id: 1n } });
    expect(arg.where.AND[2]).toEqual({ brand_id: 2n });
    expect(arg.where.AND[3]).toEqual({ price: { gte: 10 } });
    expect(arg.where.AND[4]).toEqual({ price: { lte: 20 } });
    expect(arg.include.product_variants.include.product_variant_attributes).toBe(true);
  });

  it("getByFilter omite los filtros vacíos", async () => {
    delegate.findMany.mockResolvedValue([]);
    await dao.getByFilter("", null, null, null, null);
    const arg = delegate.findMany.mock.calls[0][0];
    expect(arg.where.AND).toEqual([{}, {}, {}, {}, {}]);
  });
});

describe("ProductVariantDAO", () => {
  let delegate: any;
  let dao: ProductVariantDAO;

  beforeEach(() => {
    delegate = prismaDelegateMock();
    dao = new ProductVariantDAO({ product_variants: delegate } as any);
  });

  it("getByProduct incluye atributos e imágenes", async () => {
    delegate.findMany.mockResolvedValue([]);
    await dao.getByProduct(5n);
    expect(delegate.findMany).toHaveBeenCalledWith({
      where: { product_id: 5n },
      include: { product_variant_attributes: true, product_images: true },
    });
  });

  it("getBySKU usa findUnique y getByBarcode usa findFirst", async () => {
    delegate.findUnique.mockResolvedValue(null);
    delegate.findFirst.mockResolvedValue(null);
    await dao.getBySKU("SKU-1");
    await dao.getByBarcode("123");
    expect(delegate.findUnique).toHaveBeenCalledWith({ where: { SKU: "SKU-1" } });
    expect(delegate.findFirst).toHaveBeenCalledWith({ where: { barcode_upc: "123" } });
  });

  it("decreaseStock devuelve true solo si actualizó filas", async () => {
    delegate.updateMany.mockResolvedValue({ count: 1 });
    await expect(dao.decreaseStock(5n, 2)).resolves.toBe(true);
    expect(delegate.updateMany).toHaveBeenCalledWith({
      where: { id: 5n, stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });

    delegate.updateMany.mockResolvedValue({ count: 0 });
    await expect(dao.decreaseStock(5n, 99)).resolves.toBe(false);
  });

  it("increaseStock incrementa el stock", async () => {
    delegate.updateMany.mockResolvedValue({ count: 1 });
    await expect(dao.increaseStock(5n, 3)).resolves.toBe(true);
    expect(delegate.updateMany).toHaveBeenCalledWith({
      where: { id: 5n },
      data: { stock: { increment: 3 } },
    });
  });
});

describe("LabelDAO / VariantAttributeDAO", () => {
  it("LabelDAO.deleteByProduct devuelve true y captura errores", async () => {
    const delegate = prismaDelegateMock();
    const dao = new LabelDAO({ product_physical: delegate } as any);
    delegate.deleteMany.mockResolvedValue({ count: 2 });
    await expect(dao.deleteByProduct(5n)).resolves.toBe(true);

    delegate.deleteMany.mockRejectedValue(new Error("boom"));
    await expect(dao.deleteByProduct(5n)).resolves.toBe(false);
  });

  it("VariantAttributeDAO.deleteByVariant devuelve true y captura errores", async () => {
    const delegate = prismaDelegateMock();
    const dao = new VariantAttributeDAO({ product_variant_attributes: delegate } as any);
    delegate.deleteMany.mockResolvedValue({ count: 1 });
    await expect(dao.deleteByVariant(7n)).resolves.toBe(true);

    delegate.deleteMany.mockRejectedValue(new Error("boom"));
    await expect(dao.deleteByVariant(7n)).resolves.toBe(false);
  });
});

describe("ProductImageDAO", () => {
  let delegate: any;
  let bucket: any;
  let supabase: any;
  let dao: ProductImageDAO;

  const fakeFile = (name = "Foto Ñ.png") =>
    ({
      name,
      type: "image/png",
      arrayBuffer: async () => new ArrayBuffer(0),
    }) as unknown as File;

  beforeEach(() => {
    delegate = prismaDelegateMock();
    bucket = {
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: "https://x/product-images/5/f.png" },
      }),
      remove: vi.fn().mockResolvedValue({ data: [] }),
    };
    supabase = { storage: { from: vi.fn(() => bucket) } };
    dao = new ProductImageDAO({ product_images: delegate } as any, supabase);
  });

  it("create sube el archivo y guarda la referencia", async () => {
    delegate.create.mockResolvedValue({ id: 1n });
    const result = await dao.create(fakeFile(), 5n);
    expect(bucket.upload).toHaveBeenCalled();
    expect(delegate.create).toHaveBeenCalledWith({
      data: {
        product_id: 5n,
        variant_id: null,
        image_url: "https://x/product-images/5/f.png",
        is_main_image: false,
      },
    });
    expect(result).toEqual({ id: 1n });
  });

  it("create marca la principal y desmarca la anterior", async () => {
    delegate.create.mockResolvedValue({ id: 1n });
    delegate.updateMany.mockResolvedValue({ count: 1 });
    await dao.create(fakeFile(), 5n, true, 7n);
    expect(delegate.updateMany).toHaveBeenCalledWith({
      where: { variant_id: 7n, is_main_image: true },
      data: { is_main_image: false },
    });
    expect(delegate.create.mock.calls[0][0].data.is_main_image).toBe(true);
  });

  it("create propaga el error de subida", async () => {
    bucket.upload.mockResolvedValue({ error: { message: "sin permisos" } });
    await expect(dao.create(fakeFile(), 5n)).rejects.toThrow("sin permisos");
  });

  it("delete remueve el archivo y el registro", async () => {
    delegate.findUnique.mockResolvedValue({
      id: 1n,
      image_url: "https://x/product-images/5/f.png",
    });
    delegate.delete.mockResolvedValue({ id: 1n });

    await dao.delete(1n);
    expect(bucket.remove).toHaveBeenCalledWith(["5/f.png"]);
    expect(delegate.delete).toHaveBeenCalledWith({ where: { id: 1n } });
  });

  it("delete lanza si la imagen no existe", async () => {
    delegate.findUnique.mockResolvedValue(null);
    await expect(dao.delete(1n)).rejects.toThrow(/not found/);
  });

  it("setMain desmarca la principal anterior y marca la nueva", async () => {
    delegate.findUnique.mockResolvedValue({ id: 1n, product_id: 5n, variant_id: null });
    delegate.updateMany.mockResolvedValue({ count: 1 });
    delegate.update.mockResolvedValue({ id: 1n });

    await expect(dao.setMain(1n)).resolves.toBe(true);
    expect(delegate.updateMany).toHaveBeenCalledWith({
      where: { product_id: 5n, is_main_image: true },
      data: { is_main_image: false },
    });
    expect(delegate.update).toHaveBeenCalledWith({
      where: { id: 1n },
      data: { is_main_image: true },
    });
  });

  it("setMain devuelve false si la imagen no existe o falla", async () => {
    delegate.findUnique.mockResolvedValue(null);
    await expect(dao.setMain(1n)).resolves.toBe(false);

    delegate.findUnique.mockResolvedValue({ id: 1n, product_id: 5n, variant_id: null });
    delegate.updateMany.mockRejectedValue(new Error("boom"));
    await expect(dao.setMain(1n)).resolves.toBe(false);
  });

  it("deleteByProduct remueve todos los archivos y registros", async () => {
    delegate.findMany.mockResolvedValue([
      { image_url: "https://x/product-images/5/a.png" },
      { image_url: "https://x/product-images/5/b.png" },
      { image_url: null },
    ]);
    delegate.deleteMany.mockResolvedValue({ count: 3 });

    await expect(dao.deleteByProduct(5n)).resolves.toBe(true);
    expect(bucket.remove).toHaveBeenCalledWith(["5/a.png", "5/b.png"]);
    expect(delegate.deleteMany).toHaveBeenCalledWith({ where: { product_id: 5n } });
  });

  it("getByProduct, getMainByProduct y getByVariant consultan", async () => {
    delegate.findMany.mockResolvedValue([]);
    delegate.findFirst.mockResolvedValue(null);
    await dao.getByProduct(5n);
    await dao.getMainByProduct(5n);
    await dao.getByVariant(7n);
    expect(delegate.findMany).toHaveBeenNthCalledWith(1, { where: { product_id: 5n } });
    expect(delegate.findFirst).toHaveBeenCalledWith({
      where: { product_id: 5n, is_main_image: true },
    });
    expect(delegate.findMany).toHaveBeenNthCalledWith(2, { where: { variant_id: 7n } });
  });
});
