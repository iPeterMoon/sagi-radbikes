import { NextRequest, NextResponse } from "next/server";

const POS_URL = process.env.POS_SERVICE_URL || "http://localhost:3003";

/** GET /api/pos/productos?busqueda=xxx → GET :3003/productos */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const qs = searchParams.toString();
  const url = `${POS_URL}/productos${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
