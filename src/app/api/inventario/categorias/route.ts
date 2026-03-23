import { obtenerCategorias } from "@/backend/controladores/InventarioControlador";

export async function GET() {
  return obtenerCategorias();
}
