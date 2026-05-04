import { NextRequest, NextResponse } from "next/server";

const CATALOG = process.env.CATALOG_SERVICE_URL || "http://localhost:3002";

async function proxy(req: NextRequest, method: string, body?: string) {
  const search = req.nextUrl.search;
  const res = await fetch(`${CATALOG}/productos${search}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body,
  });
  return new NextResponse(await res.text(), { status: res.status });
}

export async function GET(req: NextRequest) { return proxy(req, "GET"); }
export async function POST(req: NextRequest) { return proxy(req, "POST", await req.text()); }
export async function PUT(req: NextRequest) { return proxy(req, "PUT", await req.text()); }
export async function PATCH(req: NextRequest) { return proxy(req, "PATCH", await req.text()); }