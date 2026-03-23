import { NextRequest, NextResponse } from "next/server";
import { obtenerPorId, eliminarProducto, actualizarProducto } from "@/backend/controladores/InventarioControlador";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return obtenerPorId(req, { params: await params });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const dto = await req.json();
  dto.idProducto = (await params).id;
  return actualizarProducto(req);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return eliminarProducto(req, { params: await params });
}
