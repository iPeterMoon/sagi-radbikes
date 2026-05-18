import { NextRequest, NextResponse } from "next/server";
import { proxyWithAuth } from "../../utils/authProxy";

export async function GET(req: NextRequest) {
  return proxyWithAuth(
    req,
    `${process.env.CATALOG_SERVICE_URL}/subcategorias${req.nextUrl.search}`,
    "GET",
  );
}

export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer();
  return proxyWithAuth(
    req,
    `${process.env.CATALOG_SERVICE_URL}/subcategorias`,
    "POST",
    body || undefined,
  );
}
