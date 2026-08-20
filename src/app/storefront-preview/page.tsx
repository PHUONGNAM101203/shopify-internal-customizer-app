"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CustomizerApp } from "@/storefront-customizer/CustomizerApp";
import { ArrowLeft, ShoppingCart, Check, Info, Sparkles, RefreshCw, Send } from "lucide-react";

interface ProductOption {
  shopifyProductId: string;
  productTitle: string;
  baseMockupUrl?: string;
  extraPrice: number;
}

export default function StorefrontPreviewPage() {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("8129384729101");
  const [selectedVariant, setSelectedVariant] = useState<string>("44910293810231");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  // Load configured products from DB
  useEffect(() => {
    async function loadConfigs() {
      try {
        setLoadingProducts(true);
        const res = await fetch("/api/admin/products");
        if (res.ok) {
          const data = await res.json();
          if (data.configs?.length) {
            setProducts(data.configs);
            setSelectedProductId(data.configs[0].shopifyProductId);
          }
        }
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadConfigs();
  }, []);

  const activeProduct = products.find((p) => p.shopifyProductId === selectedProductId) || {
    shopifyProductId: "8129384729101",
    productTitle: "Áo Thun Cotton In Slogan & Tên Cá Nhân Hóa",
    baseMockupUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    extraPrice: 3.5,
  };

  // Mock function for simulating a checkout webhook
  const handleSimulateWebhook = async () => {
    try {
      setWebhookStatus("Đang gửi giả lập webhook orders/create...");
      const mockOrder = {
        id: 992019283 + Math.floor(Math.random() * 1000),
        order_number: 1095 + Math.floor(Math.random() * 50),
        email: "khach_test_" + Date.now() + "@gmail.com",
        line_items: [
          {
            id: 11223344,
            title: activeProduct.productTitle,
            quantity: 1,
            properties: [
              { name: "_custom_design_id", value: "dsg_demo_1088" },
              { name: "Customized", value: "Yes" },
            ],
          },
        ],
      };

      const res = await fetch("/api/webhooks/orders-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-shopify-shop-domain": "wild-and-king-demo.myshopify.com",
        },
        body: JSON.stringify(mockOrder),
      });

      if (res.ok) {
        setWebhookStatus(`✅ Đã kích hoạt webhook thành công cho Đơn #${mockOrder.order_number}! Kiểm tra tab 'Hàng chờ Sản xuất' để xem đơn.`);
      }
    } catch (err: any) {
      setWebhookStatus(`❌ Lỗi gửi webhook: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Banner Notice */}
      <header className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-1 text-slate-300 hover:text-white font-medium">
            <ArrowLeft size={14} />
            <span>Quay lại Bảng Quản Trị</span>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Sparkles size={14} /> Môi trường Giả lập Storefront Theme (Simulator Mode)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSimulateWebhook}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
          >
            <Send size={12} />
            <span>Test Webhook Đơn Hàng</span>
          </button>
        </div>
      </header>

      {webhookStatus && (
        <div className="bg-emerald-50 text-emerald-900 text-xs px-6 py-2 border-b border-emerald-200 text-center font-medium">
          {webhookStatus}
        </div>
      )}

      {/* Storefront PDP Layout (Shopify Theme Mockup) */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10">
        {/* Product selector for testing */}
        <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Chọn sản phẩm test:</span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg outline-none bg-slate-50 font-medium"
            >
              {products.map((p) => (
                <option key={p.shopifyProductId} value={p.shopifyProductId}>
                  {p.productTitle} (ID: {p.shopifyProductId})
                </option>
              ))}
            </select>
          </div>
          <div className="text-slate-500">
            Giả lập cách Theme Shopify 2.0 tải App Block vào trang Product Detail
          </div>
        </div>

        {/* Storefront Product Detail Page Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-8 p-6 md:p-8">
          {/* Left Column: Product Gallery / Mockup */}
          <div className="md:col-span-5 flex flex-col items-center justify-start space-y-4">
            <div className="w-full aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center relative">
              {activeProduct.baseMockupUrl ? (
                <img
                  src={activeProduct.baseMockupUrl}
                  alt={activeProduct.productTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-400 text-xs">Chưa có ảnh Mockup</div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Ảnh sản phẩm phôi gốc từ Shopify Storefront Media
            </p>
          </div>

          {/* Right Column: Product Info & Mount Point của App Block */}
          <div className="md:col-span-7 space-y-5">
            <div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Wild & King Official
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">{activeProduct.productTitle}</h1>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-xl font-extrabold text-slate-900">$29.00</span>
                {activeProduct.extraPrice > 0 && (
                  <span className="text-xs text-slate-500">
                    (+${activeProduct.extraPrice.toFixed(2)} phí thiết kế riêng)
                  </span>
                )}
              </div>
            </div>

            {/* Standard Theme Variant Picker Mockup */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700">Kích thước (Size):</label>
              <div className="flex gap-2 text-xs">
                {["S", "M", "L", "XL"].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`px-3.5 py-1.5 border rounded-lg font-semibold ${
                      sz === "M" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* 🌟 VỊ TRÍ NHÚNG APP BLOCK (THEME APP EXTENSION MOUNT POINT) 🌟 */}
            <div className="pt-2 border-t border-slate-100">
              <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded">
                <span>📍 Shopify Theme App Block: <code>blocks/customizer.liquid</code></span>
                <span className="text-emerald-600 font-semibold">Native DOM Render (No Iframe)</span>
              </div>

              {/* React Customizer Component */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <CustomizerApp
                  key={selectedProductId}
                  productId={selectedProductId}
                  variantId={selectedVariant}
                  shopDomain="wild-and-king-demo.myshopify.com"
                  proxyUrl="/api/proxy"
                  blockTitle="🎨 Tùy Chỉnh Thiết Kế Sản Phẩm"
                  btnText="Thêm vào giỏ hàng với thiết kế này"
                  primaryColor="#008060"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
