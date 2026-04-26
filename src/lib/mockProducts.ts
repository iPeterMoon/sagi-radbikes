import { POSProduct, POSCategory } from "../types/pos";

export const POS_CATEGORIES: POSCategory[] = [
  "Todas",
  "Bicicletas",
  "Componentes",
  "Accesorios",
  "Taller",
];

export const IVA_RATE = 0.16;

// Replace with real API calls (e.g. inventarioApi.obtenerProductos())
export const MOCK_PRODUCTS: POSProduct[] = [
  {
    id: 1,
    name: "Casco MTB Fox Flux",
    category: "Accesorios",
    price: 1200,
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
    sku: "CSC-001",
  },
  {
    id: 2,
    name: 'Cámara 29" Válvula Presta',
    category: "Refacciones",
    price: 150,
    stock: 45,
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d3b?w=300&h=200&fit=crop",
    sku: "CAM-029",
  },
  {
    id: 3,
    name: "Lubricante Cadena Seco",
    category: "Mantenimiento",
    price: 250,
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=300&h=200&fit=crop",
    sku: "LUB-001",
  },
  {
    id: 4,
    name: "Puños Ergonómicos",
    category: "Componentes",
    price: 450,
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=300&h=200&fit=crop",
    sku: "PUG-002",
  },
  {
    id: 5,
    name: "Servicio Completo",
    category: "Taller",
    price: 850,
    stock: null,
    image:
      "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=300&h=200&fit=crop",
    sku: "SRV-001",
  },
  {
    id: 6,
    name: "Luz Trasera USB",
    category: "Accesorios",
    price: 400,
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=300&h=200&fit=crop",
    sku: "LUZ-002",
  },
  {
    id: 7,
    name: "Botella Agua 750ml",
    category: "Accesorios",
    price: 180,
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=200&fit=crop",
    sku: "BOT-001",
  },
  {
    id: 8,
    name: "Pedales Plataforma",
    category: "Componentes",
    price: 800,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=300&h=200&fit=crop",
    sku: "PED-003",
  },
];