import { NextRequest, NextResponse } from "next/server";
import { obtenerPorId, eliminarProducto, actualizarProducto } from "@/backend/controladores/InventarioControlador";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<any> }
) {
  const { id } = await params;
  return obtenerPorId(req, { params: { id } });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<any> }
) {
  const dto = await req.json();
  const { id } = await params;
  dto.idProducto = id;
  return actualizarProducto(req);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<any> }
) {
  const { id } = await params;
  return eliminarProducto(req, { params: { id } });
}
