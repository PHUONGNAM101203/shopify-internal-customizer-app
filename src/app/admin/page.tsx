import { db } from "@/lib/db";
import Link from "next/link";
import { Sliders, PackageCheck, Layers, CheckCircle2, ArrowRight, Activity, Database, Key } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch stats from DB
  let totalConfigs = 0;
  let totalDesigns = 0;
  let readyOrders = 0;

  try {
    totalConfigs = await db.productCustomizerConfig.count();
    totalDesigns = await db.customDesign.count();
    readyOrders = await db.customDesign.count({
      where: { status: "READY_FOR_PRODUCTION" },
    });
  } catch (err) {
    console.warn("DB not yet initialized or empty:", err);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bảng Quản Trị Customizer Nội Bộ</h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý quy tắc tùy chỉnh sản phẩm và theo dõi đơn hàng thiết kế từ Storefront
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Sliders size={14} />
            <span>Thêm Cấu Hình Sản Phẩm</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sản phẩm có Customizer</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalConfigs}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <Sliders size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Thiết Kế Tạo Ra</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalDesigns}</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Layers size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đơn Chờ Sản Xuất / In</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{readyOrders}</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <PackageCheck size={20} />
          </div>
        </div>
      </div>

      {/* Instructions & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step Guide */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>Hướng dẫn Kích hoạt trên Storefront</span>
          </h2>
          <ol className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong>Cấu hình sản phẩm:</strong> Vào tab{" "}
                <Link href="/admin/products" className="text-emerald-600 underline font-medium">
                  Cấu hình Sản phẩm
                </Link>{" "}
                để nhập Shopify Product ID, chọn font chữ, màu sắc và tải ảnh mockup mẫu.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong>Deploy Theme App Extension:</strong> Chạy lệnh <code>shopify app deploy</code> hoặc <code>npm run shopify:dev</code>.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong>Bật App Block trong Theme Editor:</strong> Vào Shopify Admin &rarr; <em>Online Store &rarr; Themes &rarr; Customize</em>. Chọn template <strong>Default product</strong>, bấm <strong>Add Block</strong> và chọn <strong>Custom Product Designer</strong>.
              </div>
            </li>
          </ol>
        </div>

        {/* Integration Status */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Activity size={18} className="text-blue-600" />
            <span>Trạng thái Tích hợp API</span>
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <Database size={15} className="text-emerald-600" />
                <span className="font-semibold text-slate-700">Cơ sở dữ liệu (Prisma/SQLite)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">Hoạt động</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <Key size={15} className="text-blue-600" />
                <span className="font-semibold text-slate-700">Shopify App Proxy Router</span>
              </div>
              <span className="text-slate-500 font-mono">/apps/customizer</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <PackageCheck size={15} className="text-purple-600" />
                <span className="font-semibold text-slate-700">Shopify Webhooks (orders/create)</span>
              </div>
              <span className="text-slate-500 font-mono">/api/webhooks/orders-create</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
