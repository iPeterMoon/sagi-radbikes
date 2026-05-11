import { NextRequest, NextResponse } from "next/server";

const POS_URL = process.env.POS_SERVICE_URL || "http://localhost:3003";

type Params = { params: Promise<{ idProducto: string }> };

/** PATCH /api/pos/carrito/[idProducto] → PATCH :3003/carrito/:idProducto/cantidad */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { idProducto } = await params;
  const body = await req.json();
  const res = await fetch(`${POS_URL}/carrito/${idProducto}/cantidad`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

/** DELETE /api/pos/carrito/[idProducto] → DELETE :3003/carrito/:idProducto */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { idProducto } = await params;
  const res = await fetch(`${POS_URL}/carrito/${idProducto}`, { method: "DELETE" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
