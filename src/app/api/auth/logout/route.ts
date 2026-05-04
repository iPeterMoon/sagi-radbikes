import { NextRequest, NextResponse } from "next/server";

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || "http://localhost:3001";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const res = await fetch(`${AUTH_SERVICE}/logout`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.text();
  const response = new NextResponse(data, { status: res.status });
  response.cookies.delete("token");
  return response;
}