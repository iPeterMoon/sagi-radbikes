import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${process.env.AUTH_SERVICE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.text();
  const response = new NextResponse(data, { status: res.status });

  const cookie = res.headers.get("set-cookie");
  if (cookie) response.headers.set("set-cookie", cookie);
  return response;
}
