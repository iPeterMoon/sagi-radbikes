import { NextRequest } from "next/server";
import { eliminarImagen } from "@/backend/controladores/InventarioControlador";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return eliminarImagen(req, { params });
}
