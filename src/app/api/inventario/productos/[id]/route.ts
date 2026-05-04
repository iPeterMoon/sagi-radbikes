import { NextRequest, NextResponse } from "next/server";

const CATALOG = process.env.CATALOG_SERVICE_URL || "http://localhost:3002";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${CATALOG}/productos/${id}`);
  return new NextResponse(await res.text(), { status: res.status });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  body.idProducto = id;
  const res = await fetch(`${CATALOG}/productos`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return new NextResponse(await res.text(), { status: res.status });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${CATALOG}/productos/${id}`, { method: "DELETE" });
  return new NextResponse(await res.text(), { status: res.status });
}