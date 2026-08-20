import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const shop = url.searchParams.get("shop") || undefined;
    const status = url.searchParams.get("status") || undefined;

    const designs = await db.customDesign.findMany({
      where: {
        ...(shop ? { shop } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ designs });
  } catch (error: any) {
    console.error("Error fetching order designs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { designId, status } = body;

    if (!designId || !status) {
      return NextResponse.json({ error: "Missing designId or status" }, { status: 400 });
    }

    const updated = await db.customDesign.update({
      where: { id: designId },
      data: { status },
    });

    return NextResponse.json({ success: true, design: updated });
  } catch (error: any) {
    console.error("Error updating design status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
