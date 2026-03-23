import { NextRequest, NextResponse } from "next/server";
import { obtenerEtiquetas, crearEtiqueta, eliminarEtiqueta } from "@/backend/controladores/InventarioControlador";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<any> }
) {
  const { productoId } = await params;
  return obtenerEtiquetas(req, { params: { id: productoId } });
}

export async function POST(req: NextRequest) {
  return crearEtiqueta(req);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<any> }
) {
  const { productoId } = await params;
  return eliminarEtiqueta(req, { params: { id: productoId } });
}
