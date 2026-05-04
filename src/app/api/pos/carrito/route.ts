import { NextRequest, NextResponse } from "next/server";

const POS_URL = process.env.POS_SERVICE_URL || "http://localhost:3003";

/** GET /api/pos/carrito → GET :3003/carrito */
export async function GET() {
  const res = await fetch(`${POS_URL}/carrito`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

/** DELETE /api/pos/carrito → DELETE :3003/carrito (limpiar todo) */
export async function DELETE() {
  const res = await fetch(`${POS_URL}/carrito`, { method: "DELETE" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

/** POST /api/pos/carrito (agregar) → POST :3003/carrito/agregar */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${POS_URL}/carrito/agregar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
