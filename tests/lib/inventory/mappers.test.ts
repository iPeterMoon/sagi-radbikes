import { describe, expect, it } from "vitest";
import { ProductoMapper } from "@/lib/inventory/negocio/mappers/ProductoMapper";
import { VarianteMapper } from "@/lib/inventory/negocio/mappers/VarianteMapper";
import { ImagenProductoMapper } from "@/lib/inventory/negocio/mappers/ImagenProductoMapper";
import { CategoriaMapper } from "@/lib/inventory/negocio/mappers/CategoriaMapper";
import { MarcaMapper } from "@/lib/inventory/negocio/mappers/MarcaMapper";
import { SubCategoriaMapper } from "@/lib/inventory/negocio/mappers/SubCategoriaMapper";
import { EtiquetaMapper } from "@/lib/inventory/negocio/mappers/EtiquetaMapper";
import { AtributoVarianteMapper } from "@/lib/inventory/negocio/mappers/AtributoVarianteMapper";
import { EstadoStock } from "@/lib/inventory/negocio/enums/EstadoStock";

 

const category = (over: any = {}) => ({
  id: 1n,
  created_at: new Date(),
  name: "Componentes",
  description: "Piezas",
  ...over,
});

const subcategory = (over: any = {}) => ({
  id: 2n,
  created_at: new Date(),
  name: "Transmisión",
  category_id: 1n,
  categories: category(),
  ...over,
});

const brand = (over: any = {}) => ({
  id: 3n,
  created_at: new Date(),
  name: "Shimano",
  ...over,
});

const image = (over: any = {}) => ({
  id: 10n,
  created_at: new Date(),
  image_url: "https://x/img.png",
  product_id: 5n,
  variant_id: null,
  is_main_image: false,
  ...over,
});

const attribute = (over: any = {}) => ({
  id: 20n,
  created_at: new Date(),
  name: "Color",
  value: "Negro",
  variant_id: 7n,
  ...over,
});

const variant = (over: any = {}) => ({
  id: 7n,
  created_at: new Date(),
  product_id: 5n,
  SKU: "SKU-7",
  barcode_upc: "123456",
  price: 250,
  cost: 150,
  stock: 8,
  min_stock: 4,
  is_active: true,
  product_variant_attributes: [],
  product_images: [],
  ...over,
});

const product = (over: any = {}) => ({
  id: 5n,
  created_at: new Date(),
  name: "Bicicleta",
  price: 500,
  cost: 300,
  description: "Una bici",
  min_stock: 2,
  is_active: true,
  calcular_iva: true,
  subcategory_id: 2n,
  brand_id: 3n,
  product_images: [],
  subcategory: undefined,
  brands: undefined,
  product_physical: [],
  product_variants: [],
  ...over,
});

describe("ImagenProductoMapper", () => {
  it("mapea la entidad a DTO", () => {
    expect(
      ImagenProductoMapper.toDTO(image({ is_main_image: true }) as any),
    ).toEqual({
      idImagen: "10",
      url: "https://x/img.png",
      esPrincipal: true,
    });
  });

  it("usa valores por defecto si los campos vienen nulos", () => {
    expect(
      ImagenProductoMapper.toDTO(image({ image_url: null, is_main_image: null }) as any),
    ).toEqual({ idImagen: "10", url: "", esPrincipal: false });
  });

  it("toEntity convierte el DTO a entidad", () => {
    expect(
      ImagenProductoMapper.toEntity({
        idImagen: "10",
        url: "u",
        esPrincipal: true,
      }),
    ).toEqual({ id: 10n, image_url: "u", is_main_image: true });
  });
});

describe("CategoriaMapper", () => {
  it("toDTO usa cadena vacía cuando el nombre es nulo", () => {
    expect(CategoriaMapper.toDTO(category({ name: null, description: null }) as any)).toEqual({
      idCategoria: "1",
      nombre: "",
      descripcion: "",
    });
  });

  it("toEntity incluye el id solo cuando viene", () => {
    expect(CategoriaMapper.toEntity({ idCategoria: "", nombre: "X", descripcion: "d" })).toEqual({
      name: "X",
      description: "d",
    });
    expect(
      CategoriaMapper.toEntity({ idCategoria: "4", nombre: "X", descripcion: "d" }),
    ).toEqual({ id: 4n, name: "X", description: "d" });
  });
});

describe("MarcaMapper", () => {
  it("toDTO usa cadena vacía cuando el nombre es nulo", () => {
    expect(MarcaMapper.toDTO(brand({ name: null }) as any)).toEqual({
      idMarca: "3",
      nombre: "",
    });
  });

  it("toEntity incluye el id solo cuando viene", () => {
    expect(MarcaMapper.toEntity({ idMarca: "", nombre: "X" })).toEqual({ name: "X" });
    expect(MarcaMapper.toEntity({ idMarca: "3", nombre: "X" })).toEqual({
      id: 3n,
      name: "X",
    });
  });
});

describe("SubCategoriaMapper", () => {
  it("toDTO mapea categoría padre nula a cadena vacía", () => {
    expect(
      SubCategoriaMapper.toDTO(subcategory({ name: null, category_id: null }) as any),
    ).toEqual({ idSubCategoria: "2", nombre: "", idCategoria: "" });
  });

  it("toEntity convierte category_id a bigint e incluye id cuando viene", () => {
    expect(
      SubCategoriaMapper.toEntity({
        idSubCategoria: "",
        nombre: "S",
        idCategoria: "1",
      }),
    ).toEqual({ name: "S", category_id: 1n });
    expect(
      SubCategoriaMapper.toEntity({
        idSubCategoria: "9",
        nombre: "S",
        idCategoria: "1",
      }),
    ).toEqual({ id: 9n, name: "S", category_id: 1n });
  });
});

describe("EtiquetaMapper", () => {
  it("toDTO usa cadena vacía con valores nulos", () => {
    expect(
      EtiquetaMapper.toDTO({ id: 1n, created_at: new Date(), name: null, value: null, product_id: 5n } as any),
    ).toEqual({ idEtiqueta: "1", nombre: "", valor: "" });
  });

  it("toEntityFromCreate convierte idProducto a bigint", () => {
    expect(
      EtiquetaMapper.toEntityFromCreate({ nombre: "N", valor: "V", idProducto: "5" }),
    ).toMatchObject({ name: "N", value: "V", product_id: 5n });
  });
});

describe("AtributoVarianteMapper", () => {
  it("toDTO usa cadena vacía con valores nulos", () => {
    expect(
      AtributoVarianteMapper.toDTO({ id: 1n, created_at: new Date(), name: null, value: null, variant_id: 7n } as any),
    ).toEqual({ idAtributo: "1", nombre: "", valor: "" });
  });

  it("toEntityFromCreate convierte idVariante a bigint", () => {
    expect(
      AtributoVarianteMapper.toEntityFromCreate({ nombre: "N", valor: "V", idVariante: "7" }),
    ).toMatchObject({ name: "N", value: "V", variant_id: 7n });
  });
});

describe("VarianteMapper", () => {
  it("mapea una variante completa con atributos e imágenes", () => {
    const dto = VarianteMapper.toDTO(
      variant({
        product_variant_attributes: [attribute()],
        product_images: [image({ variant_id: 7n })],
      }) as any,
    );

    expect(dto).toMatchObject({
      idVariante: "7",
      idProducto: "5",
      sku: "SKU-7",
      codigoDeBarras: "123456",
      precio: 250,
      costo: 150,
      stock: 8,
      minStock: 4,
      activo: true,
    });
    expect(dto.atributos).toHaveLength(1);
    expect(dto.imagenes).toHaveLength(1);
  });

  it("conserva minStock null y aplica defaults cuando faltan campos", () => {
    const dto = VarianteMapper.toDTO(
      variant({
        barcode_upc: null,
        price: 0,
        cost: null,
        stock: null,
        min_stock: null,
        is_active: null,
        product_variant_attributes: undefined,
        product_images: undefined,
      }) as any,
    );
    expect(dto.codigoDeBarras).toBe("");
    expect(dto.precio).toBe(0);
    expect(dto.costo).toBe(0);
    expect(dto.stock).toBe(0);
    expect(dto.minStock).toBeNull();
    expect(dto.activo).toBe(true);
    expect(dto.imagenes).toEqual([]);
    expect(dto.atributos).toEqual([]);
  });
});

describe("ProductoMapper.calcularEstadoVariante", () => {
  it("NORMAL cuando el mínimo es null", () => {
    expect(ProductoMapper.calcularEstadoVariante(0, null)).toBe(EstadoStock.NORMAL);
  });

  it("CRITICO con stock <= 50% del mínimo", () => {
    expect(ProductoMapper.calcularEstadoVariante(0, 10)).toBe(EstadoStock.CRITICO);
    expect(ProductoMapper.calcularEstadoVariante(5, 10)).toBe(EstadoStock.CRITICO);
  });

  it("BAJO con stock entre 50% y el mínimo", () => {
    expect(ProductoMapper.calcularEstadoVariante(6, 10)).toBe(EstadoStock.BAJO);
    expect(ProductoMapper.calcularEstadoVariante(10, 10)).toBe(EstadoStock.BAJO);
  });

  it("NORMAL por encima del mínimo", () => {
    expect(ProductoMapper.calcularEstadoVariante(11, 10)).toBe(EstadoStock.NORMAL);
  });
});

describe("ProductoMapper.calcularEstadoStock", () => {
  it("devuelve NORMAL sin variantes", () => {
    expect(ProductoMapper.calcularEstadoStock([])).toBe(EstadoStock.NORMAL);
  });

  it("toma el peor estado", () => {
    expect(
      ProductoMapper.calcularEstadoStock([
        { stock: 100, minStock: 10 },
        { stock: 5, minStock: 10 },
      ]),
    ).toBe(EstadoStock.CRITICO);
  });
});

describe("ProductoMapper.toDTO", () => {
  it("mapea el producto completo con relaciones", () => {
    const dto = ProductoMapper.toDTO(
      product({
        subcategory: subcategory(),
        brands: brand(),
        product_images: [image({ is_main_image: true })],
        product_physical: [
          { id: 1n, created_at: new Date(), name: "Peso", value: "10kg", product_id: 5n },
        ],
        product_variants: [
          variant({ id: 7n, stock: 8, min_stock: 4, is_active: true }),
          variant({ id: 8n, stock: 0, min_stock: 4, is_active: false }),
        ],
      }) as any,
    );

    expect(dto).toMatchObject({
      idProducto: "5",
      nombre: "Bicicleta",
      precioReferencia: 500,
      costoReferencia: 300,
      descripcion: "Una bici",
      minStockReferencia: 2,
      activo: true,
      calcularIVA: true,
      estadoStock: EstadoStock.NORMAL,
    });
    expect(dto.categoria).toEqual({
      idCategoria: "1",
      nombre: "Componentes",
      descripcion: "Piezas",
    });
    expect(dto.marca).toEqual({ idMarca: "3", nombre: "Shimano" });
    expect(dto.subcategoria).toEqual({
      idSubCategoria: "2",
      nombre: "Transmisión",
      idCategoria: "1",
    });
    expect(dto.imagenes).toHaveLength(1);
    expect(dto.etiquetas).toEqual([{ idEtiqueta: "1", nombre: "Peso", valor: "10kg" }]);
    // Incluye todas las variantes, incluso inactivas
    expect(dto.variantes).toHaveLength(2);
    // El estado ignora la variante inactiva con stock 0
    expect(dto.estadoStock).toBe(EstadoStock.NORMAL);
  });

  it("usa valores por defecto sin relaciones", () => {
    const dto = ProductoMapper.toDTO(product({ product_variants: undefined }) as any);
    expect(dto.categoria).toEqual({ idCategoria: "", nombre: "", descripcion: "" });
    expect(dto.marca).toEqual({ idMarca: "", nombre: "" });
    expect(dto.subcategoria).toEqual({ idSubCategoria: "", nombre: "", idCategoria: "" });
    expect(dto.imagenes).toEqual([]);
    expect(dto.etiquetas).toEqual([]);
    expect(dto.variantes).toEqual([]);
    expect(dto.estadoStock).toBe(EstadoStock.NORMAL);
  });

  it("marca inactivo y calcula el peor estado entre variantes activas", () => {
    const dto = ProductoMapper.toDTO(
      product({
        is_active: false,
        name: null,
        price: null,
        cost: null,
        description: null,
        min_stock: null,
        product_variants: [variant({ stock: 0, min_stock: 4, is_active: true })],
      }) as any,
    );
    expect(dto.nombre).toBe("");
    expect(dto.precioReferencia).toBe(0);
    expect(dto.costoReferencia).toBe(0);
    expect(dto.minStockReferencia).toBe(0);
    expect(dto.activo).toBe(false);
    expect(dto.estadoStock).toBe(EstadoStock.CRITICO);
  });

  it("mapea calcular_iva a calcularIVA y usa true por defecto", () => {
    expect(ProductoMapper.toDTO(product({ calcular_iva: false }) as any).calcularIVA).toBe(
      false,
    );
    expect(
      ProductoMapper.toDTO(product({ calcular_iva: undefined }) as any).calcularIVA,
    ).toBe(true);
  });
});
