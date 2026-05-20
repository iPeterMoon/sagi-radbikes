import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ idProducto: string }> };

/** PATCH /api/pos/carrito/[idProducto] → PATCH :3003/carrito/:idProducto/cantidad */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { idProducto } = await params;
  const body = await req.text();
  const res = await fetch(
    `${process.env.POS_SERVICE_URL}/carrito/${idProducto}/cantidad`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/xml",
        "Accept": "application/xml",
      },
      body: body || undefined,
    },
  );
  const responseText = await res.text();
  return new NextResponse(responseText, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") || "application/xml" },
  });
}

/** DELETE /api/pos/carrito/[idProducto] → DELETE :3003/carrito/:idProducto */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { idProducto } = await params;
  const res = await fetch(
    `${process.env.POS_SERVICE_URL}/carrito/${idProducto}`,
    { method: "DELETE" },
  );
  const responseText = await res.text();
  return new NextResponse(responseText, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") || "application/xml" },
  });
}
