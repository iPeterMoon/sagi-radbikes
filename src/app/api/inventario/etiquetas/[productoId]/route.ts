import { NextRequest, NextResponse } from "next/server";
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productoId: string }> },
) {
  const { productoId } = await params;
  const res = await fetch(
    `${process.env.CATALOG_SERVICE_URL}/etiquetas/${productoId}`,
  );
  return new NextResponse(await res.text(), { status: res.status });
}
export async function POST(req: NextRequest) {
  const res = await fetch(`${process.env.CATALOG_SERVICE_URL}/etiquetas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
  return new NextResponse(await res.text(), { status: res.status });
}
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productoId: string }> },
) {
  const { productoId } = await params;
  const res = await fetch(
    `${process.env.CATALOG_SERVICE_URL}/etiquetas/${productoId}`,
    { method: "DELETE" },
  );
  return new NextResponse(await res.text(), { status: res.status });
}
