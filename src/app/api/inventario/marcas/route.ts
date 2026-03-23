import {
  obtenerMarcas,
  crearMarca,
} from "@/backend/controladores/InventarioControlador";

export async function GET() {
  return obtenerMarcas();
}

export async function POST(req: Request) {
  return crearMarca(req as any);
}
