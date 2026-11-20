import type { Product, ProductVariant } from "@/types/inventory";

/** Variante de producto para pruebas, con valores por defecto sanos. */
export function makeVariant(overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: 1,
    sku: "SKU-1",
    barcode: "",
    price: 100,
    cost: 50,
    stock: 10,
    minStock: 5,
    active: true,
    image: "",
    attributes: [],
    ...overrides,
  };
}

/** Producto para pruebas, con valores por defecto sanos. */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: "Producto",
    brand: "Marca",
    category: "Categoría",
    subcategory: "Subcategoría",
    referencePrice: 100,
    referenceCost: 50,
    referenceMinStock: 5,
    description: "",
    tags: [],
    active: true,
    tieneIVA: true,
    image: "",
    variants: [],
    ...overrides,
  };
}
