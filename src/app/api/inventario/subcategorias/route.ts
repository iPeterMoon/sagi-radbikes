import { NextRequest } from "next/server";
import { obtenerSubCategorias } from "@/backend/controladores/InventarioControlador";

export async function GET(req: NextRequest) {
  return obtenerSubCategorias(req);
}
