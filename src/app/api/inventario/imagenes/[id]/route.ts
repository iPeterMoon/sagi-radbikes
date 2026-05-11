import { NextRequest, NextResponse } from "next/server";
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const res = await fetch(`${process.env.CATALOG_SERVICE_URL}/imagenes/${id}`, {
    method: "DELETE",
  });
  return new NextResponse(await res.text(), { status: res.status });
}
