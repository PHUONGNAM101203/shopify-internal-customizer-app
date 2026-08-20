import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const shop = url.searchParams.get("shop") || "internal-store.myshopify.com";

    const configs = await db.productCustomizerConfig.findMany({
      where: { shop },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      configs: configs.map((c) => ({
        ...c,
        availableFonts: JSON.parse(c.availableFonts || "[]"),
        availableColors: JSON.parse(c.availableColors || "[]"),
      })),
    });
  } catch (error: any) {
    console.error("Error fetching configs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      shop = "internal-store.myshopify.com",
      shopifyProductId,
      productTitle,
      isEnabled = true,
      allowCustomText = true,
      allowImageUpload = true,
      allowColorPicker = true,
      availableFonts = ["Roboto", "Montserrat", "Playfair Display"],
      availableColors = ["#111827", "#DC2626", "#2563EB", "#16A34A"],
      baseMockupUrl,
      extraPrice = 0,
    } = body;

    if (!shopifyProductId || !productTitle) {
      return NextResponse.json({ error: "Product ID and Title are required" }, { status: 400 });
    }

    const savedConfig = await db.productCustomizerConfig.upsert({
      where: { shopifyProductId: String(shopifyProductId) },
      update: {
        shop,
        productTitle,
        isEnabled,
        allowCustomText,
        allowImageUpload,
        allowColorPicker,
        availableFonts: JSON.stringify(availableFonts),
        availableColors: JSON.stringify(availableColors),
        baseMockupUrl,
        extraPrice: parseFloat(String(extraPrice)) || 0,
      },
      create: {
        shop,
        shopifyProductId: String(shopifyProductId),
        productTitle,
        isEnabled,
        allowCustomText,
        allowImageUpload,
        allowColorPicker,
        availableFonts: JSON.stringify(availableFonts),
        availableColors: JSON.stringify(availableColors),
        baseMockupUrl,
        extraPrice: parseFloat(String(extraPrice)) || 0,
      },
    });

    return NextResponse.json({
      success: true,
      config: savedConfig,
      message: "Configuration saved successfully",
    });
  } catch (error: any) {
    console.error("Error saving product config:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
