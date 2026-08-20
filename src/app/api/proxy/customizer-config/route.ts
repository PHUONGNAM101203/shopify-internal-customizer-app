import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyShopifyProxySignature } from "@/lib/hmac";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const shop = url.searchParams.get("shop");
    const productId = url.searchParams.get("productId");

    // Verify HMAC signature in production
    if (process.env.NODE_ENV === "production") {
      const isValid = verifyShopifyProxySignature(url.searchParams);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 401 });
      }
    }

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    // Find customizer configuration in DB
    const config = await db.productCustomizerConfig.findFirst({
      where: {
        shopifyProductId: String(productId),
        ...(shop ? { shop } : {}),
      },
    });

    if (!config) {
      // Default config fallback
      return NextResponse.json({
        config: {
          isEnabled: true,
          allowCustomText: true,
          allowImageUpload: true,
          allowColorPicker: true,
          availableFonts: ["Roboto", "Montserrat", "Playfair Display", "Dancing Script", "Pacifico"],
          availableColors: ["#111827", "#DC2626", "#2563EB", "#16A34A", "#D97706", "#FFFFFF"],
          extraPrice: 0,
        },
      });
    }

    return NextResponse.json({
      config: {
        ...config,
        availableFonts: JSON.parse(config.availableFonts || "[]"),
        availableColors: JSON.parse(config.availableColors || "[]"),
      },
    });
  } catch (error: any) {
    console.error("Error loading customizer config:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
