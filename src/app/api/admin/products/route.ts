import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const configs = await db.productConfig.findMany({
      include: {
        optionGroups: {
          include: {
            values: {
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        compatibilityRules: true,
        priceRules: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ configs });
  } catch (error: any) {
    console.error("Error fetching configs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      shopifyProductId,
      productTitle,
      basePrice = 65.0,
      baseMockupUrl,
      isEnabled = true,
      groups = [],
    } = body;

    if (!shopifyProductId || !productTitle) {
      return NextResponse.json({ error: "Product ID and Title are required" }, { status: 400 });
    }

    const config = await db.productConfig.upsert({
      where: { shopifyProductId: String(shopifyProductId) },
      update: {
        productTitle,
        basePrice: parseFloat(String(basePrice)) || 0,
        baseMockupUrl,
        isEnabled,
      },
      create: {
        shopifyProductId: String(shopifyProductId),
        productTitle,
        basePrice: parseFloat(String(basePrice)) || 0,
        baseMockupUrl,
        isEnabled,
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error("Error saving product config:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
