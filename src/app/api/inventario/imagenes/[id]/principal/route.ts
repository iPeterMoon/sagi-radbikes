import { NextRequest, NextResponse } from "next/server";
const CATALOG = process.env.CATALOG_SERVICE_URL || "http://localhost:3002";
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${CATALOG}/imagenes/${id}/principal`, { method: "PATCH" });
  return new NextResponse(await res.text(), { status: res.status });
}