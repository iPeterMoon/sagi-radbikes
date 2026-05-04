import { NextRequest, NextResponse } from "next/server";

const POS_URL = process.env.POS_SERVICE_URL || "http://localhost:3003";

/** POST /api/pos/venta → POST :3003/venta */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${POS_URL}/venta`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
