import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu gieo dữ liệu Customizer Watchstrap & Leather Craft...");

  // 1. Shop Demo
  const shop = await prisma.shop.upsert({
    where: { shop: "wildandking-demo.myshopify.com" },
    update: {},
    create: {
      shop: "wildandking-demo.myshopify.com",
      accessToken: "shpat_demo_access_token_wk2026",
      scope: "read_products,write_products,read_orders,write_orders,read_themes,write_themes",
      installed: true,
    },
  });

  // 2. Product Config: Custom Watch Strap (Dây đồng hồ da thủ công)
  const config = await prisma.productConfig.upsert({
    where: { shopifyProductId: "8129384729101" },
    update: {},
    create: {
      id: "cfg_watchstrap_001",
      shop: "wildandking-demo.myshopify.com",
      shopifyProductId: "8129384729101",
      productTitle: "Custom Bespoke Watch Strap (Dây Đồng Hồ Thủ Công)",
      basePrice: 65.0,
      baseMockupUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
      isEnabled: true,
    },
  });

  // 3. Option Groups & Values
  // Group 1: Leather Type
  const leatherGroup = await prisma.optionGroup.create({
    data: {
      productConfigId: config.id,
      name: "Chất Liệu Da (Leather)",
      type: "LEATHER",
      sortOrder: 1,
      values: {
        create: [
          { name: "Black Buttero (Ý)", code: "buttero-black", colorHex: "#171717", extraPrice: 0.0, inStock: true, sortOrder: 1 },
          { name: "Classic Tan Buttero", code: "buttero-tan", colorHex: "#B45309", extraPrice: 5.0, inStock: true, sortOrder: 2 },
          { name: "Burgundy Shell Cordovan", code: "cordovan-burgundy", colorHex: "#831843", extraPrice: 20.0, inStock: true, sortOrder: 3 },
          { name: "Olive Pueblo Leather", code: "pueblo-olive", colorHex: "#3F6212", extraPrice: 12.0, inStock: true, sortOrder: 4 },
          { name: "Navy Blue Epsom", code: "epsom-navy", colorHex: "#1E3A8A", extraPrice: 10.0, inStock: true, sortOrder: 5 },
        ],
      },
    },
  });

  // Group 2: Buckle Style
  const buckleGroup = await prisma.optionGroup.create({
    data: {
      productConfigId: config.id,
      name: "Kiểu Khóa (Buckle)",
      type: "BUCKLE",
      sortOrder: 2,
      values: {
        create: [
          { name: "Matte Black PVD", code: "matte-black", colorHex: "#262626", extraPrice: 0.0, inStock: true, sortOrder: 1 },
          { name: "Brushed 316L Silver", code: "brushed-silver", colorHex: "#D1D5DB", extraPrice: 0.0, inStock: true, sortOrder: 2 },
          { name: "18K Rose Gold Finish", code: "rose-gold", colorHex: "#FBCFE8", extraPrice: 15.0, inStock: true, sortOrder: 3 },
          { name: "Vintage Brass", code: "vintage-brass", colorHex: "#CA8A04", extraPrice: 8.0, inStock: true, sortOrder: 4 },
        ],
      },
    },
  });

  // Group 3: Lug Width
  const widthGroup = await prisma.optionGroup.create({
    data: {
      productConfigId: config.id,
      name: "Kích Thước Bản Dây (Lug Width)",
      type: "SIZE",
      sortOrder: 3,
      values: {
        create: [
          { name: "18 mm", code: "18mm", extraPrice: 0.0, inStock: true, sortOrder: 1 },
          { name: "20 mm", code: "20mm", extraPrice: 0.0, inStock: true, sortOrder: 2 },
          { name: "22 mm", code: "22mm", extraPrice: 0.0, inStock: true, sortOrder: 3 },
          { name: "24 mm", code: "24mm", extraPrice: 2.0, inStock: true, sortOrder: 4 },
        ],
      },
    },
  });

  // 4. Sample Custom Design & Production Job
  const design = await prisma.design.create({
    data: {
      id: "dsg_8rf91",
      productConfigId: config.id,
      shop: "wildandking-demo.myshopify.com",
      productId: "8129384729101",
      variantId: "44910293810231",
      engravingText: "WILD & KING 2026",
      engravingFont: "Pacifico",
      engravingColor: "#FFFFFF",
      totalExtraPrice: 20.0,
      status: "IN_PRODUCTION",
      selections: {
        create: [
          { groupName: "Chất Liệu Da", valueName: "Burgundy Shell Cordovan", extraPrice: 20.0 },
          { groupName: "Kiểu Khóa", valueName: "Brushed 316L Silver", extraPrice: 0.0 },
          { groupName: "Kích Thước", valueName: "22 mm", extraPrice: 0.0 },
        ],
      },
      productionJob: {
        create: {
          shopifyOrderId: "gid://shopify/Order/59281928301",
          shopifyOrderNumber: "1088",
          customerEmail: "vip.customer@wildking.vn",
          shippingAddress: "123 Le Loi, District 1, Ho Chi Minh City",
          status: "IN_PRODUCTION",
          notes: "Khách yêu cầu khâu chỉ sáp thủ công viền đôi.",
        },
      },
    },
  });

  console.log("✅ Đã gieo dữ liệu thành công! Design ID mẫu:", design.id);
}

main()
  .catch((e) => console.error("❌ Seed Error:", e))
  .finally(() => prisma.$disconnect());
