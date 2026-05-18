import { NextRequest, NextResponse } from "next/server";
import { proxyWithAuth } from "../../utils/authProxy";

/** POST /api/pos/venta → POST :3003/venta */
export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer();
  return proxyWithAuth(
    req,
    `${process.env.POS_SERVICE_URL}/venta`,
    "POST",
    body || undefined,
  );
}
