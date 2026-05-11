import { NextRequest, NextResponse } from "next/server";
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const res = await fetch(
    `${process.env.CATALOG_SERVICE_URL}/imagenes/${id}/principal`,
    { method: "PATCH" },
  );
  return new NextResponse(await res.text(), { status: res.status });
}
