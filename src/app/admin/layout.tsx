import Link from "next/link";
import { LayoutDashboard, Sliders, PackageCheck, ExternalLink, Sparkles } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f6f7] flex flex-col">
      {/* Top App Bar (Shopify Admin Style) */}
      <header className="bg-[#1a1a1a] text-white px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-900 text-sm">
            🎨
          </div>
          <div>
            <span className="font-bold text-sm">Product Customizer Admin</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 font-medium">
              Internal App
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors"
          >
            <LayoutDashboard size={15} />
            <span>Tổng quan</span>
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors"
          >
            <Sliders size={15} />
            <span>Cấu hình Sản phẩm</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors"
          >
            <PackageCheck size={15} />
            <span>Hàng chờ Sản xuất</span>
          </Link>
          <Link
            href="/storefront-preview"
            className="flex items-center gap-1.5 text-xs bg-emerald-700 hover:bg-emerald-600 text-white font-medium px-3 py-1.5 rounded-md transition-colors ml-2"
          >
            <ExternalLink size={14} />
            <span>Xem Giả Lập Storefront</span>
          </Link>
        </nav>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
