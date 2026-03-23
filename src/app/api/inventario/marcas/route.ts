import { obtenerMarcas } from "@/backend/controladores/InventarioControlador";

export async function GET() {
  return obtenerMarcas();
}
