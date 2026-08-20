import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyShopifyWebhook } from "@/lib/hmac";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
    const shopHeader = req.headers.get("x-shopify-shop-domain") || "";

    // Verify Shopify HMAC signature
    if (process.env.NODE_ENV === "production") {
      const isValid = verifyShopifyWebhook(rawBody, hmacHeader);
      if (!isValid) {
        console.error("❌ Invalid Shopify Webhook HMAC Signature");
        return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });
      }
    }

    const order = JSON.parse(rawBody);
    console.log(`📦 Webhook received: Order #${order.order_number} (ID: ${order.id}) from ${shopHeader}`);

    const matchedDesigns: string[] = [];

    if (order.line_items && Array.isArray(order.line_items)) {
      for (const lineItem of order.line_items) {
        // Find _custom_design_id in line item properties
        const designProperty = lineItem.properties?.find(
          (p: { name: string; value: string }) => p.name === "_custom_design_id"
        );

        if (designProperty && designProperty.value) {
          const designId = designProperty.value;
          console.log(`🎯 Linking Order #${order.order_number} to Custom Design: ${designId}`);

          try {
            await db.customDesign.update({
              where: { id: designId },
              data: {
                status: "READY_FOR_PRODUCTION",
                shopifyOrderId: String(order.id),
                shopifyOrderNumber: String(order.order_number),
                customerEmail: order.email || order.customer?.email || null,
              },
            });
            matchedDesigns.push(designId);
          } catch (dbErr) {
            console.warn(`Could not update design ${designId} in DB:`, dbErr);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed order #${order.order_number}`,
      matchedDesignsCount: matchedDesigns.length,
      matchedDesigns,
    });
  } catch (error: any) {
    console.error("❌ Error processing orders-create webhook:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
