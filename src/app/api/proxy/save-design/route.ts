import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyShopifyProxySignature } from "@/lib/hmac";
import crypto from "crypto";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const shop = url.searchParams.get("shop") || "internal-store.myshopify.com";

    // Verify Shopify HMAC signature
    if (process.env.NODE_ENV === "production") {
      const isValid = verifyShopifyProxySignature(url.searchParams);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 401 });
      }
    }

    const body = await req.json();
    const {
      productId,
      variantId,
      customText,
      fontFamily,
      textColor,
      customImageUrl,
      previewImageUrl,
      rawDesignData,
      customerEmail,
    } = body;

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const designId = "dsg_" + crypto.randomUUID();

    const savedDesign = await db.customDesign.create({
      data: {
        id: designId,
        shop,
        productId: String(productId),
        variantId: variantId ? String(variantId) : null,
        customText: customText || null,
        fontFamily: fontFamily || null,
        textColor: textColor || null,
        customImageUrl: customImageUrl || null,
        previewImageUrl: previewImageUrl || null,
        rawDesignData: typeof rawDesignData === "string" ? rawDesignData : JSON.stringify(rawDesignData || {}),
        status: "DRAFT",
        customerEmail: customerEmail || null,
      },
    });

    return NextResponse.json({
      success: true,
      designId: savedDesign.id,
      message: "Custom design saved successfully",
    });
  } catch (error: any) {
    console.error("Error saving custom design:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
