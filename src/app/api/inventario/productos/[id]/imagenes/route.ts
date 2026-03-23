import { NextRequest } from "next/server";
import { agregarImagenes } from "@/backend/controladores/InventarioControlador";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return agregarImagenes(req, { params: { idProducto: id } });
}
