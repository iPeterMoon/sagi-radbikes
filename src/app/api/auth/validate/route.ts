import { NextRequest, NextResponse } from "next/server";

async function validate(req: NextRequest) {
  const token =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.cookies.get("token")?.value;

  const res = await fetch(`${process.env.AUTH_SERVICE_URL}/validate`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.text();
  return new NextResponse(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  return await validate(req);
}

export async function GET(req: NextRequest) {
  return await validate(req);
}
