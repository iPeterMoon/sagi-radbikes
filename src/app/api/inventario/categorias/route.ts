import {
  obtenerCategorias,
  crearCategoria,
} from "@/backend/controladores/InventarioControlador";

export async function GET() {
  return obtenerCategorias();
}

export async function POST(req: Request) {
  return crearCategoria(req as any);
}
