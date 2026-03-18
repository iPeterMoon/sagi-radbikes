import { Product } from "@/types/inventory";

export const CATEGORIES: string[] = [
  "Bicicletas",
  "Accesorios",
  "Repuestos",
  "Ropa",
  "Herramientas",
];

export const BRANDS: string[] = [
  "Specialized",
  "Trek",
  "Giant",
  "Scott",
  "Shimano",
  "Fox",
  "SRAM",
];

export const SUBCATEGORIES: Record<string, string[]> = {
  Bicicletas: ["Montaña", "Carretera", "Eléctrica", "Híbrida", "BMX"],
  Accesorios: ["Protección", "Iluminación", "Candados", "Bolsos"],
  Repuestos: ["Frenos", "Transmisión", "Ruedas"],
  Ropa: ["Camisetas", "Pantalones", "Guantes"],
  Herramientas: ["Llaves", "Bombas", "Kits"],
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Carbon Pro 2024",
    sku: "RB-MTB-001",
    barcode: "7501234567890",
    brand: "Specialized",
    category: "Bicicletas",
    subcategory: "Montaña",
    price: 2499.0,
    stock: 45,
    minStock: 5,
    description:
      "Bicicleta de montaña de alta gama con cuadro de carbono reforzado, transmisión Shimano XT de 12 velocidades y suspensión Fox Performance.",
    tags: [
      { name: "Rodado", value: "29" },
      { name: "Talla", value: "L" },
      { name: "Material", value: "Carbono" },
    ],
    active: true,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop",
    hasSalesHistory: false,
  },
  {
    id: 2,
    name: "E-City Voyager",
    sku: "RB-ELT-012",
    barcode: "7501234567891",
    brand: "Trek",
    category: "Bicicletas",
    subcategory: "Eléctrica",
    price: 3150.0,
    stock: 8,
    minStock: 10,
    description:
      "Bicicleta eléctrica urbana con motor Bosch de 250W y batería de 500Wh.",
    tags: [{ name: "Autonomía", value: "120km" }],
    active: true,
    image:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=80&h=80&fit=crop",
    hasSalesHistory: false,
  },
  {
    id: 3,
    name: "Aero Sprint R3",
    sku: "RB-ROA-118",
    barcode: "7501234567892",
    brand: "Giant",
    category: "Bicicletas",
    subcategory: "Carretera",
    price: 1890.0,
    stock: 2,
    minStock: 5,
    description: "Bicicleta de carretera aerodinámica para competición.",
    tags: [{ name: "Cuadro", value: "Aluminio" }],
    active: true,
    image:
      "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=80&h=80&fit=crop",
    hasSalesHistory: true,
  },
  {
    id: 4,
    name: "Urban Flow Hybrid",
    sku: "RB-HYB-033",
    barcode: "7501234567893",
    brand: "Scott",
    category: "Bicicletas",
    subcategory: "Híbrida",
    price: 950.0,
    stock: 112,
    minStock: 15,
    description: "Híbrida urbana ideal para el día a día.",
    tags: [],
    active: true,
    image:
      "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=80&h=80&fit=crop",
    hasSalesHistory: false,
  },
  {
    id: 5,
    name: "Casco Pro Stealth",
    sku: "ACC-PEL-204",
    barcode: "7501234567894",
    brand: "Shimano",
    category: "Accesorios",
    subcategory: "Protección",
    price: 120.0,
    stock: 14,
    minStock: 20,
    description: "Casco aerodinámico con ventilación optimizada.",
    tags: [],
    active: false,
    image:
      "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=80&h=80&fit=crop",
    hasSalesHistory: false,
  },
];
