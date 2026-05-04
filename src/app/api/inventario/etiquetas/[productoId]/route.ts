import { NextRequest, NextResponse } from "next/server";
const CATALOG = process.env.CATALOG_SERVICE_URL || "http://localhost:3002";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ productoId: string }> }) {
  const { productoId } = await params;
  const res = await fetch(`${CATALOG}/etiquetas/${productoId}`);
  return new NextResponse(await res.text(), { status: res.status });
}
export async function POST(req: NextRequest) {
  const res = await fetch(`${CATALOG}/etiquetas`, { method: "POST", headers: { "Content-Type": "application/json" }, body: await req.text() });
  return new NextResponse(await res.text(), { status: res.status });
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ productoId: string }> }) {
  const { productoId } = await params;
  const res = await fetch(`${CATALOG}/etiquetas/${productoId}`, { method: "DELETE" });
  return new NextResponse(await res.text(), { status: res.status });
}