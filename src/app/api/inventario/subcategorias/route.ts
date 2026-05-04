import { NextRequest, NextResponse } from "next/server";
const CATALOG = process.env.CATALOG_SERVICE_URL || "http://localhost:3002";
export async function GET(req: NextRequest) {
  const res = await fetch(`${CATALOG}/subcategorias${req.nextUrl.search}`);
  return new NextResponse(await res.text(), { status: res.status });
}
export async function POST(req: NextRequest) {
  const res = await fetch(`${CATALOG}/subcategorias`, { method: "POST", headers: { "Content-Type": "application/json" }, body: await req.text() });
  return new NextResponse(await res.text(), { status: res.status });
}