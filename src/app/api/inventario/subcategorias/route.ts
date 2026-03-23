import { NextRequest } from "next/server";
import {
  obtenerSubCategorias,
  crearSubCategoria,
} from "@/backend/controladores/InventarioControlador";

export async function GET(req: NextRequest) {
  return obtenerSubCategorias(req);
}

export async function POST(req: Request) {
  return crearSubCategoria(req as any);
}
