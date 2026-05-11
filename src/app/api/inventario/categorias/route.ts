import { NextRequest, NextResponse } from "next/server";
export async function GET() {
  const res = await fetch(`${process.env.CATALOG_SERVICE_URL}/categorias`);
  return new NextResponse(await res.text(), { status: res.status });
}
export async function POST(req: NextRequest) {
  const res = await fetch(`${process.env.CATALOG_SERVICE_URL}/categorias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
  return new NextResponse(await res.text(), { status: res.status });
}
