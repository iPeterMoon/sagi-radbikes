import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const res = await fetch(`${process.env.AUTH_SERVICE_URL}/logout`, {
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
