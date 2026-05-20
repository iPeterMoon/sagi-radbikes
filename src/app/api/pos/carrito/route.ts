import { NextRequest, NextResponse } from "next/server";
import { proxyWithAuth } from "../../utils/authProxy";

/** GET /api/pos/carrito → GET :3003/carrito */
export async function GET(req: NextRequest) {
  return proxyWithAuth(req, `${process.env.POS_SERVICE_URL}/carrito`, "GET");
}

/** DELETE /api/pos/carrito → DELETE :3003/carrito (limpiar todo) */
export async function DELETE(req: NextRequest) {
  return proxyWithAuth(req, `${process.env.POS_SERVICE_URL}/carrito`, "DELETE");
}

/** POST /api/pos/carrito (agregar) → POST :3003/carrito/agregar */
export async function POST(req: NextRequest) {
  const body = await req.text();
  return proxyWithAuth(
    req,
    `${process.env.POS_SERVICE_URL}/carrito/agregar`,
    "POST",
    body || undefined,
  );
}
