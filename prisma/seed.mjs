import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu gieo dữ liệu mẫu (Seeding demo data)...");

  // 1. Tạo Shop Demo
  const shop = await prisma.shop.upsert({
    where: { shop: "wild-and-king-demo.myshopify.com" },
    update: {},
    create: {
      shop: "wild-and-king-demo.myshopify.com",
      accessToken: "shpat_demo_access_token_wk2026",
      scope: "read_products,write_products,read_orders,write_orders,read_themes,write_themes",
      installed: true,
    },
  });
  console.log("✅ Đã tạo Shop demo:", shop.shop);

  // 2. Tạo Cấu hình Customizer Mẫu cho các Sản phẩm
  const products = [
    {
      shopifyProductId: "8129384729101",
      productTitle: "Áo Thun Cotton In Slogan & Tên Cá Nhân Hóa",
      isEnabled: true,
      allowCustomText: true,
      allowImageUpload: true,
      allowColorPicker: true,
      availableFonts: JSON.stringify(["Roboto", "Montserrat", "Playfair Display", "Dancing Script", "Pacifico"]),
      availableColors: JSON.stringify(["#111827", "#DC2626", "#2563EB", "#16A34A", "#D97706", "#FFFFFF"]),
      baseMockupUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      extraPrice: 3.5,
    },
    {
      shopifyProductId: "8129384729102",
      productTitle: "Bình Giữ Nhiệt Khắc Tên Laser Cao Cấp",
      isEnabled: true,
      allowCustomText: true,
      allowImageUpload: false,
      allowColorPicker: true,
      availableFonts: JSON.stringify(["Montserrat", "Playfair Display", "Dancing Script"]),
      availableColors: JSON.stringify(["#111827", "#FFFFFF", "#D97706"]),
      baseMockupUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
      extraPrice: 2.0,
    },
    {
      shopifyProductId: "8129384729103",
      productTitle: "Ví Da Nam Khắc Chữ Kỷ Niệm",
      isEnabled: true,
      allowCustomText: true,
      allowImageUpload: false,
      allowColorPicker: true,
      availableFonts: JSON.stringify(["Playfair Display", "Dancing Script"]),
      availableColors: JSON.stringify(["#D97706", "#111827"]),
      baseMockupUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
      extraPrice: 5.0,
    },
  ];

  for (const prod of products) {
    await prisma.productCustomizerConfig.upsert({
      where: { shopifyProductId: prod.shopifyProductId },
      update: prod,
      create: {
        ...prod,
        shop: "wild-and-king-demo.myshopify.com",
      },
    });
  }
  console.log(`✅ Đã tạo cấu hình cho ${products.length} sản phẩm mẫu.`);

  // 3. Tạo Đơn hàng Tùy chỉnh Mẫu trong Hàng chờ Sản xuất
  const sampleDesigns = [
    {
      id: "dsg_demo_1088",
      shop: "wild-and-king-demo.myshopify.com",
      productId: "8129384729101",
      variantId: "44910293810231",
      customText: "Wild & King - Est. 2026",
      fontFamily: "Pacifico",
      textColor: "#111827",
      status: "READY_FOR_PRODUCTION",
      shopifyOrderId: "gid://shopify/Order/59281928301",
      shopifyOrderNumber: "1088",
      customerEmail: "khachhang1@gmail.com",
      rawDesignData: JSON.stringify({ text: "Wild & King - Est. 2026", font: "Pacifico", color: "#111827", fontSize: 28 }),
    },
    {
      id: "dsg_demo_1089",
      shop: "wild-and-king-demo.myshopify.com",
      productId: "8129384729102",
      variantId: "44910293810232",
      customText: "Phương Nam & Hoàng Lan ❤️ 20.08",
      fontFamily: "Dancing Script",
      textColor: "#DC2626",
      status: "IN_PRODUCTION",
      shopifyOrderId: "gid://shopify/Order/59281928302",
      shopifyOrderNumber: "1089",
      customerEmail: "nam.phuong@company.com",
      rawDesignData: JSON.stringify({ text: "Phương Nam & Hoàng Lan ❤️ 20.08", font: "Dancing Script", color: "#DC2626", fontSize: 24 }),
    },
    {
      id: "dsg_demo_1090",
      shop: "wild-and-king-demo.myshopify.com",
      productId: "8129384729103",
      variantId: "44910293810233",
      customText: "CHAMPION 2026",
      fontFamily: "Montserrat",
      textColor: "#D97706",
      status: "COMPLETED",
      shopifyOrderId: "gid://shopify/Order/59281928303",
      shopifyOrderNumber: "1090",
      customerEmail: "contact@wildking.vn",
      rawDesignData: JSON.stringify({ text: "CHAMPION 2026", font: "Montserrat", color: "#D97706", fontSize: 22 }),
    },
  ];

  for (const dsg of sampleDesigns) {
    await prisma.customDesign.upsert({
      where: { id: dsg.id },
      update: dsg,
      create: dsg,
    });
  }
  console.log(`✅ Đã tạo ${sampleDesigns.length} đơn hàng thiết kế mẫu trong hàng chờ sản xuất.`);

  console.log("🎉 Seed dữ liệu mẫu hoàn tất!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi seed dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
