import { beforeEach, describe, expect, it } from "vitest";
import { ProductoBO } from "@/lib/inventory/negocio/BOs/ProductoBO";
import { VarianteBO } from "@/lib/inventory/negocio/BOs/VarianteBO";
import { CategoriaBO } from "@/lib/inventory/negocio/BOs/CategoriaBO";
import { MarcaBO } from "@/lib/inventory/negocio/BOs/MarcaBO";
import { SubCategoriaBO } from "@/lib/inventory/negocio/BOs/SubCategoriaBO";
import { EtiquetaBO } from "@/lib/inventory/negocio/BOs/EtiquetaBO";
import { catalogoAccesoMock } from "../../helpers/mocks";

 

const productoEntity = (over: any = {}) => ({
  id: 5n,
  created_at: new Date(),
  name: "Bici",
  price: 500,
  cost: 300,
  description: "d",
  min_stock: 2,
  is_active: true,
  subcategory_id: 2n,
  brand_id: 3n,
  ...over,
});

const varianteEntity = (over: any = {}) => ({
  id: 7n,
  created_at: new Date(),
  product_id: 5n,
  SKU: "SKU-7",
  barcode_upc: "999",
  price: 100,
  cost: 50,
  stock: 4,
  min_stock: 2,
  is_active: true,
  ...over,
});

const filtroBase = {
  busqueda: "",
  idCategoria: "",
  idMarca: "",
  estadoStock: "",
  idSubCategoria: "",
  precioMin: 0,
  precioMax: 0,
};

describe("ProductoBO", () => {
  let acceso: any;
  let bo: ProductoBO;

  beforeEach(() => {
    acceso = catalogoAccesoMock();
    bo = new ProductoBO(acceso);
  });

  it("obtenerTodos convierte ids y usa null para filtros vacíos", async () => {
    acceso.productDAO.getByFilter.mockResolvedValue([productoEntity()]);
    const dtos = await bo.obtenerTodos({ ...filtroBase });

    expect(acceso.productDAO.getByFilter).toHaveBeenCalledWith("", null, null, null, null);
    expect(dtos[0].idProducto).toBe("5");
  });

  it("obtenerTodos convierte filtros presentes a bigint", async () => {
    acceso.productDAO.getByFilter.mockResolvedValue([]);
    await bo.obtenerTodos({
      ...filtroBase,
      busqueda: "bici",
      idCategoria: "1",
      idMarca: "2",
      precioMin: 10,
      precioMax: 20,
    });
    expect(acceso.productDAO.getByFilter).toHaveBeenCalledWith("bici", 1n, 2n, 10, 20);
  });

  it("obtenerPorId incluye relaciones y devuelve null si no existe", async () => {
    acceso.productDAO.getById.mockResolvedValue(null);
    await expect(bo.obtenerPorId("5")).resolves.toBeNull();
    expect(acceso.productDAO.getById).toHaveBeenCalledWith(
      5n,
      expect.objectContaining({ product_images: true, brands: true }),
    );
  });

  it("obtenerPorCategoria y obtenerPorStockDebajoDe delegan al DAO", async () => {
    acceso.productDAO.getByCategory.mockResolvedValue([productoEntity()]);
    acceso.productDAO.getBelowStock.mockResolvedValue([productoEntity()]);
    await expect(bo.obtenerPorCategoria("2")).resolves.toHaveLength(1);
    await expect(bo.obtenerPorStockDebajoDe(3)).resolves.toHaveLength(1);
    expect(acceso.productDAO.getByCategory).toHaveBeenCalledWith(2n);
    expect(acceso.productDAO.getBelowStock).toHaveBeenCalledWith(3);
  });

  it("crear crea el producto, su primera variante y sus etiquetas", async () => {
    acceso.productDAO.create.mockResolvedValue(productoEntity());
    acceso.variantDAO.create.mockResolvedValue(varianteEntity());

    const dto = {
      nombre: "Bici",
      precio: 500,
      costo: 300,
      stock: 4,
      codigoDeBarras: "123",
      minStock: 2,
      descripcion: "d",
      idCategoria: "1",
      idMarca: "3",
      idSubCategoria: "2",
      imagenesArchivo: [],
      etiquetas: [{ name: "Peso", value: "10kg" }],
    };

    const dtoSalida = await bo.crear(dto as any);

    expect(acceso.productDAO.create).toHaveBeenCalledWith({
      name: "Bici",
      price: 500,
      cost: 300,
      min_stock: 2,
      description: "d",
      brand_id: 3n,
      subcategory_id: 2n,
      is_active: true,
      calcular_iva: true,
    });
    const varianteCreada = acceso.variantDAO.create.mock.calls[0][0];
    expect(varianteCreada).toMatchObject({
      product_id: 5n,
      barcode_upc: "123",
      price: 500,
      stock: 4,
      min_stock: 2,
      is_active: true,
    });
    expect(varianteCreada.SKU).toMatch(/^SKU-\d+-[a-z0-9]+$/);
    expect(acceso.labelDAO.create).toHaveBeenCalledWith({
      name: "Peso",
      value: "10kg",
      product_id: 5n,
    });
    expect(dtoSalida.idProducto).toBe("5");
  });

  it("crear usa defaults cuando faltan campos opcionales", async () => {
    acceso.productDAO.create.mockResolvedValue(productoEntity());
    acceso.variantDAO.create.mockResolvedValue(varianteEntity());

    await bo.crear({
      nombre: "Bici",
      precio: 100,
      stock: 1,
      descripcion: "d",
      idCategoria: "1",
      idMarca: "3",
      idSubCategoria: "2",
      imagenesArchivo: [],
    } as any);

    const producto = acceso.productDAO.create.mock.calls[0][0];
    expect(producto.cost).toBeNull();
    expect(producto.min_stock).toBe(0);
    expect(producto.calcular_iva).toBe(true);
    expect(acceso.variantDAO.create.mock.calls[0][0].barcode_upc).toBeNull();
    expect(acceso.labelDAO.create).not.toHaveBeenCalled();
  });

  it("crear respeta calcularIVA=false (precio con IVA incluido)", async () => {
    acceso.productDAO.create.mockResolvedValue(productoEntity());
    acceso.variantDAO.create.mockResolvedValue(varianteEntity());

    await bo.crear({
      nombre: "Servicio",
      precio: 100,
      stock: 0,
      descripcion: "d",
      idCategoria: "1",
      idMarca: "3",
      idSubCategoria: "2",
      imagenesArchivo: [],
      calcularIVA: false,
    } as any);

    expect(acceso.productDAO.create.mock.calls[0][0].calcular_iva).toBe(false);
  });

  it("actualizar reemplaza etiquetas y elimina imágenes", async () => {
    acceso.productDAO.update.mockResolvedValue(productoEntity());
    acceso.labelDAO.deleteByProduct.mockResolvedValue(true);
    acceso.productImageDAO.delete.mockResolvedValue({ id: 1n });

    const dto = {
      idProducto: "5",
      nombre: "Nuevo",
      precio: 600,
      costo: 350,
      stock: 0,
      minStock: 1,
      descripcion: "nueva",
      idMarca: "3",
      idSubCategoria: "2",
      imagenesNuevas: [],
      imagenesEliminar: ["11", "12"],
      idImagenPrincipal: "",
      etiquetas: [{ name: "Color", value: "Rojo" }],
    };

    await bo.actualizar(dto as any);

    expect(acceso.productDAO.update).toHaveBeenCalledWith(
      5n,
      expect.objectContaining({ name: "Nuevo", brand_id: 3n, calcular_iva: true }),
    );
    expect(acceso.labelDAO.deleteByProduct).toHaveBeenCalledWith(5n);
    expect(acceso.labelDAO.create).toHaveBeenCalledWith({
      name: "Color",
      value: "Rojo",
      product_id: 5n,
    });
    expect(acceso.productImageDAO.delete).toHaveBeenCalledTimes(2);
    expect(acceso.productImageDAO.delete).toHaveBeenCalledWith(11n);
  });

  it("actualizar no toca etiquetas ni imágenes si no vienen", async () => {
    acceso.productDAO.update.mockResolvedValue(productoEntity());
    await bo.actualizar({
      idProducto: "5",
      nombre: "N",
      precio: 1,
      stock: 0,
      descripcion: "d",
      idMarca: "3",
      idSubCategoria: "2",
      imagenesNuevas: [],
      imagenesEliminar: [],
      idImagenPrincipal: "",
    } as any);
    expect(acceso.labelDAO.deleteByProduct).not.toHaveBeenCalled();
    expect(acceso.productImageDAO.delete).not.toHaveBeenCalled();
  });

  it("eliminar borra el producto y sus imágenes", async () => {
    acceso.productDAO.delete.mockResolvedValue(productoEntity());
    acceso.productImageDAO.deleteByProduct.mockResolvedValue(true);
    await expect(bo.eliminar("5")).resolves.toBe(true);
    expect(acceso.productDAO.delete).toHaveBeenCalledWith(5n);
    expect(acceso.productImageDAO.deleteByProduct).toHaveBeenCalledWith(5n);
  });

  it("agregarImagenes marca la principal por índice y la variante", async () => {
    acceso.productImageDAO.create.mockResolvedValue({});
    const archivos = [new File([], "a.png"), new File([], "b.png")];
    await bo.agregarImagenes("5", archivos, 1, "7");

    expect(acceso.productImageDAO.create).toHaveBeenNthCalledWith(1, archivos[0], 5n, false, 7n);
    expect(acceso.productImageDAO.create).toHaveBeenNthCalledWith(2, archivos[1], 5n, true, 7n);
  });

  it("agregarImagenes sin variante ni principal", async () => {
    acceso.productImageDAO.create.mockResolvedValue({});
    await bo.agregarImagenes("5", [new File([], "a.png")]);
    expect(acceso.productImageDAO.create).toHaveBeenCalledWith(
      expect.any(File),
      5n,
      false,
      undefined,
    );
  });

  it("eliminarImagen y establecerImagenPrincipal delegan", async () => {
    acceso.productImageDAO.delete.mockResolvedValue({});
    acceso.productImageDAO.setMain.mockResolvedValue(true);
    await expect(bo.eliminarImagen("9")).resolves.toBe(true);
    await expect(bo.establecerImagenPrincipal("9")).resolves.toBe(true);
    expect(acceso.productImageDAO.delete).toHaveBeenCalledWith(9n);
    expect(acceso.productImageDAO.setMain).toHaveBeenCalledWith(9n);
  });

  it("actualizarEstado alterna is_active y devuelve false si no existe", async () => {
    acceso.productDAO.getById.mockResolvedValue(productoEntity({ is_active: true }));
    acceso.productDAO.update.mockResolvedValue({});
    await expect(bo.actualizarEstado("5")).resolves.toBe(true);
    expect(acceso.productDAO.update).toHaveBeenCalledWith(5n, { is_active: false });

    acceso.productDAO.getById.mockResolvedValue(null);
    await expect(bo.actualizarEstado("5")).resolves.toBe(false);
  });
});

describe("VarianteBO", () => {
  let acceso: any;
  let bo: VarianteBO;

  beforeEach(() => {
    acceso = catalogoAccesoMock();
    bo = new VarianteBO(acceso);
  });

  it("obtenerPorProducto mapea las variantes", async () => {
    acceso.variantDAO.getByProduct.mockResolvedValue([varianteEntity()]);
    const dtos = await bo.obtenerPorProducto("5");
    expect(acceso.variantDAO.getByProduct).toHaveBeenCalledWith(5n);
    expect(dtos[0].idVariante).toBe("7");
  });

  it("crear genera SKU y crea atributos", async () => {
    acceso.variantDAO.create.mockResolvedValue(varianteEntity());
    acceso.variantAttributeDAO.create.mockResolvedValue({});

    const dto = await bo.crear({
      idProducto: "5",
      precio: 100,
      costo: 50,
      stock: 3,
      minStock: 2,
      codigoDeBarras: "123",
      atributos: [{ nombre: "Color", valor: "Rojo" }],
    } as any);

    const entity = acceso.variantDAO.create.mock.calls[0][0];
    expect(entity.SKU).toMatch(/^SKU-\d+-[a-z0-9]+$/);
    expect(entity).toMatchObject({
      product_id: 5n,
      price: 100,
      stock: 3,
      min_stock: 2,
      is_active: true,
    });
    expect(acceso.variantAttributeDAO.create).toHaveBeenCalledWith({
      name: "Color",
      value: "Rojo",
      variant_id: 7n,
    });
    expect(dto.idVariante).toBe("7");
  });

  it("crear conserva minStock null", async () => {
    acceso.variantDAO.create.mockResolvedValue(varianteEntity({ min_stock: null }));
    await bo.crear({
      idProducto: "5",
      precio: 1,
      stock: 0,
      descripcion: "",
    } as any);
    expect(acceso.variantDAO.create.mock.calls[0][0].min_stock).toBeNull();
  });

  it("actualizar reemplaza atributos e incluye activo solo si viene", async () => {
    acceso.variantDAO.update.mockResolvedValue(varianteEntity());
    acceso.variantAttributeDAO.deleteByVariant.mockResolvedValue(true);
    acceso.variantAttributeDAO.create.mockResolvedValue({});

    await bo.actualizar({
      idVariante: "7",
      precio: 200,
      stock: 1,
      activo: false,
      atributos: [{ nombre: "Talla", valor: "M" }],
    } as any);

    expect(acceso.variantDAO.update).toHaveBeenCalledWith(
      7n,
      expect.objectContaining({ price: 200, stock: 1, is_active: false }),
    );
    expect(acceso.variantAttributeDAO.deleteByVariant).toHaveBeenCalledWith(7n);
    expect(acceso.variantAttributeDAO.create).toHaveBeenCalledWith({
      name: "Talla",
      value: "M",
      variant_id: 7n,
    });
  });

  it("actualizar sin activo no envía is_active", async () => {
    acceso.variantDAO.update.mockResolvedValue(varianteEntity());
    await bo.actualizar({ idVariante: "7", precio: 1, stock: 0 } as any);
    const entity = acceso.variantDAO.update.mock.calls[0][1];
    expect(entity).not.toHaveProperty("is_active");
  });

  it("eliminar delega", async () => {
    acceso.variantDAO.delete.mockResolvedValue(varianteEntity());
    await expect(bo.eliminar("7")).resolves.toBe(true);
    expect(acceso.variantDAO.delete).toHaveBeenCalledWith(7n);
  });

  it("ajustarStock maneja delta cero, negativo y positivo", async () => {
    acceso.variantDAO.decreaseStock.mockResolvedValue(true);
    acceso.variantDAO.increaseStock.mockResolvedValue(false);

    await expect(bo.ajustarStock("7", 0)).resolves.toBe(true);
    expect(acceso.variantDAO.decreaseStock).not.toHaveBeenCalled();

    await expect(bo.ajustarStock("7", -3)).resolves.toBe(true);
    expect(acceso.variantDAO.decreaseStock).toHaveBeenCalledWith(7n, 3);

    await expect(bo.ajustarStock("7", 2)).resolves.toBe(false);
    expect(acceso.variantDAO.increaseStock).toHaveBeenCalledWith(7n, 2);
  });

  it("actualizarEstado alterna y devuelve false si no existe", async () => {
    acceso.variantDAO.getById.mockResolvedValue(varianteEntity({ is_active: false }));
    acceso.variantDAO.update.mockResolvedValue({});
    await expect(bo.actualizarEstado("7")).resolves.toBe(true);
    expect(acceso.variantDAO.update).toHaveBeenCalledWith(7n, { is_active: true });

    acceso.variantDAO.getById.mockResolvedValue(null);
    await expect(bo.actualizarEstado("7")).resolves.toBe(false);
  });

  it("obtenerAtributosPorVariante mapea atributos", async () => {
    acceso.variantAttributeDAO.getByVariant.mockResolvedValue([
      { id: 1n, created_at: new Date(), name: "Color", value: "Rojo", variant_id: 7n },
    ]);
    const atributos = await bo.obtenerAtributosPorVariante("7");
    expect(atributos).toEqual([{ idAtributo: "1", nombre: "Color", valor: "Rojo" }]);
  });

  it("crearAtributo y eliminarAtributo delegan", async () => {
    acceso.variantAttributeDAO.create.mockResolvedValue({
      id: 2n,
      created_at: new Date(),
      name: "Talla",
      value: "M",
      variant_id: 7n,
    });
    acceso.variantAttributeDAO.delete.mockResolvedValue({});
    await expect(
      bo.crearAtributo({ nombre: "Talla", valor: "M", idVariante: "7" }),
    ).resolves.toEqual({ idAtributo: "2", nombre: "Talla", valor: "M" });
    await expect(bo.eliminarAtributo("2")).resolves.toBe(true);
    expect(acceso.variantAttributeDAO.delete).toHaveBeenCalledWith(2n);
  });
});

describe("BOs de catálogo simples", () => {
  let acceso: any;

  beforeEach(() => {
    acceso = catalogoAccesoMock();
  });

  it("CategoriaBO delega CRUD", async () => {
    const bo = new CategoriaBO(acceso);
    acceso.categoryDAO.getAll.mockResolvedValue([
      { id: 1n, created_at: new Date(), name: "C", description: "d" },
    ]);
    acceso.categoryDAO.getById.mockResolvedValue(null);
    acceso.categoryDAO.create.mockResolvedValue({
      id: 2n,
      created_at: new Date(),
      name: "N",
      description: "d",
    });
    acceso.categoryDAO.update.mockResolvedValue({
      id: 2n,
      created_at: new Date(),
      name: "U",
      description: "d",
    });
    acceso.categoryDAO.delete.mockResolvedValue({});

    await expect(bo.obtenerTodas()).resolves.toEqual([
      { idCategoria: "1", nombre: "C", descripcion: "d" },
    ]);
    await expect(bo.obtenerPorId("9")).resolves.toBeNull();
    await expect(bo.crear({ idCategoria: "", nombre: "N", descripcion: "d" })).resolves.toMatchObject(
      { idCategoria: "2" },
    );
    await expect(
      bo.actualizar({ idCategoria: "2", nombre: "U", descripcion: "d" }),
    ).resolves.toMatchObject({ nombre: "U" });
    await expect(bo.eliminar("2")).resolves.toBe(true);
  });

  it("MarcaBO delega CRUD", async () => {
    const bo = new MarcaBO(acceso);
    acceso.brandDAO.getAll.mockResolvedValue([
      { id: 1n, created_at: new Date(), name: "M" },
    ]);
    acceso.brandDAO.getById.mockResolvedValue(null);
    acceso.brandDAO.create.mockResolvedValue({ id: 2n, created_at: new Date(), name: "N" });
    acceso.brandDAO.update.mockResolvedValue({ id: 2n, created_at: new Date(), name: "U" });
    acceso.brandDAO.delete.mockResolvedValue({});

    await expect(bo.obtenerTodas()).resolves.toEqual([{ idMarca: "1", nombre: "M" }]);
    await expect(bo.obtenerPorId("9")).resolves.toBeNull();
    await expect(bo.crear({ idMarca: "", nombre: "N" })).resolves.toMatchObject({
      idMarca: "2",
    });
    await expect(bo.actualizar({ idMarca: "2", nombre: "U" })).resolves.toMatchObject({
      nombre: "U",
    });
    await expect(bo.eliminar("2")).resolves.toBe(true);
  });

  it("SubCategoriaBO delega CRUD y filtros", async () => {
    const bo = new SubCategoriaBO(acceso);
    const sub = { id: 1n, created_at: new Date(), name: "S", category_id: 2n };
    acceso.subCategoryDAO.getAll.mockResolvedValue([sub]);
    acceso.subCategoryDAO.getByCategory.mockResolvedValue([sub]);
    acceso.subCategoryDAO.getById.mockResolvedValue(null);
    acceso.subCategoryDAO.create.mockResolvedValue(sub);
    acceso.subCategoryDAO.update.mockResolvedValue(sub);
    acceso.subCategoryDAO.delete.mockResolvedValue({});

    await expect(bo.obtenerTodas()).resolves.toHaveLength(1);
    await expect(bo.obtenerPorCategoria("2")).resolves.toHaveLength(1);
    expect(acceso.subCategoryDAO.getByCategory).toHaveBeenCalledWith(2n);
    await expect(bo.obtenerPorId("9")).resolves.toBeNull();
    await expect(
      bo.crear({ idSubCategoria: "", nombre: "S", idCategoria: "2" }),
    ).resolves.toMatchObject({ idSubCategoria: "1" });
    await expect(
      bo.actualizar({ idSubCategoria: "1", nombre: "S", idCategoria: "2" }),
    ).resolves.toBeDefined();
    await expect(bo.eliminar("1")).resolves.toBe(true);
  });

  it("EtiquetaBO delega CRUD y borrado por producto", async () => {
    const bo = new EtiquetaBO(acceso);
    const etiqueta = {
      id: 1n,
      created_at: new Date(),
      name: "Peso",
      value: "10",
      product_id: 5n,
    };
    acceso.labelDAO.getByProduct.mockResolvedValue([etiqueta]);
    acceso.labelDAO.create.mockResolvedValue(etiqueta);
    acceso.labelDAO.update.mockResolvedValue(etiqueta);
    acceso.labelDAO.delete.mockResolvedValue({});
    acceso.labelDAO.deleteByProduct.mockResolvedValue(true);

    await expect(bo.obtenerPorProducto("5")).resolves.toEqual([
      { idEtiqueta: "1", nombre: "Peso", valor: "10" },
    ]);
    await expect(
      bo.crear({ nombre: "Peso", valor: "10", idProducto: "5" }),
    ).resolves.toMatchObject({ idEtiqueta: "1" });
    await expect(
      bo.actualizar({ idEtiqueta: "1", nombre: "Peso", valor: "10" }),
    ).resolves.toBeDefined();
    await expect(bo.eliminar("1")).resolves.toBe(true);
    await expect(bo.eliminarPorProducto("5")).resolves.toBe(true);
  });
});
