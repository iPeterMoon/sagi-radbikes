import { NextRequest, NextResponse } from "next/server";
import { proxyWithAuth } from "../../utils/authProxy";

/** GET /api/pos/productos?busqueda=xxx → GET :3003/productos */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const qs = searchParams.toString();
  const url = `${process.env.POS_SERVICE_URL}/productos${qs ? `?${qs}` : ""}`;

  return proxyWithAuth(req, url, "GET");
}
