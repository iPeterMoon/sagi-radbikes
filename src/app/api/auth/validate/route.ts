import { NextRequest, NextResponse } from "next/server";

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || "http://localhost:3001";

async function validate(req: NextRequest) {
  const token = 
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.cookies.get("token")?.value;

  const res = await fetch(`${AUTH_SERVICE}/validate`, {
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
