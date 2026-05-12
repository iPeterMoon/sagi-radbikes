import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(
      `${process.env.CATALOG_SERVICE_URL}/subcategorias${req.nextUrl.search}`,
    );
    return new NextResponse(await res.text(), { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const res = await fetch(`${process.env.CATALOG_SERVICE_URL}/subcategorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await req.text(),
    });
    return new NextResponse(await res.text(), { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
