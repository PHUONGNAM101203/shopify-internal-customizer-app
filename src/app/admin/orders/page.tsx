"use client";

import React, { useState, useEffect } from "react";
import { Package, RefreshCw, CheckCircle, Clock, FileText, Download, ExternalLink } from "lucide-react";

interface CustomDesign {
  id: string;
  shop: string;
  productId: string;
  variantId?: string;
  customText?: string;
  fontFamily?: string;
  textColor?: string;
  customImageUrl?: string;
  previewImageUrl?: string;
  rawDesignData?: string;
  status: string;
  shopifyOrderId?: string;
  shopifyOrderNumber?: string;
  customerEmail?: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  DRAFT: { label: "Bản nháp (Chưa thanh toán)", bg: "bg-slate-100", text: "text-slate-600" },
  ORDERED: { label: "Đã đặt hàng", bg: "bg-blue-100", text: "text-blue-800" },
  READY_FOR_PRODUCTION: { label: "Sẵn sàng sản xuất", bg: "bg-amber-100", text: "text-amber-800" },
  IN_PRODUCTION: { label: "Đang in / Chế tác", bg: "bg-purple-100", text: "text-purple-800" },
  COMPLETED: { label: "Hoàn tất", bg: "bg-emerald-100", text: "text-emerald-800" },
};

export default function AdminOrdersPage() {
  const [designs, setDesigns] = useState<CustomDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = selectedStatus === "ALL" ? "/api/admin/orders" : `/api/admin/orders?status=${selectedStatus}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDesigns(data.designs || []);
      }
    } catch (err) {
      console.error("Error fetching order designs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const updateStatus = async (designId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designId, status: newStatus }),
      });
      if (res.ok) {
        setDesigns(designs.map((d) => (d.id === designId ? { ...d, status: newStatus } : d)));
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hàng Chờ Sản Xuất & In Ấn</h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý và xuất thông tin thiết kế của khách hàng từ đơn hàng Shopify
          </p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs">
        {["ALL", "READY_FOR_PRODUCTION", "IN_PRODUCTION", "COMPLETED", "DRAFT"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedStatus === st ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {st === "ALL" ? "Tất cả" : STATUS_LABELS[st]?.label || st}
          </button>
        ))}
      </div>

      {/* Designs List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Đang tải danh sách đơn sản xuất...</div>
        ) : designs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Package size={32} className="mx-auto text-slate-300" />
            <p className="text-xs">Chưa có đơn hàng tùy chỉnh nào trong mục này.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {designs.map((d) => {
              const statusInfo = STATUS_LABELS[d.status] || {
                label: d.status,
                bg: "bg-slate-100",
                text: "text-slate-700",
              };
              return (
                <div key={d.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-slate-900">
                        {d.shopifyOrderNumber ? `Order #${d.shopifyOrderNumber}` : "Bản nháp Customizer"}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-slate-600">
                      <div>
                        <span className="text-slate-400">Design ID: </span>
                        <code className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{d.id}</code>
                      </div>
                      <div>
                        <span className="text-slate-400">Product ID: </span>
                        <span>{d.productId}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Email khách: </span>
                        <span>{d.customerEmail || "Chưa có"}</span>
                      </div>
                    </div>

                    {/* Customizer Details */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                      <div className="font-semibold text-slate-800">Chi tiết Tùy chỉnh:</div>
                      {d.customText && (
                        <div>
                          <strong>Nội dung in/khắc:</strong>{" "}
                          <span
                            style={{
                              fontFamily: d.fontFamily || "inherit",
                              color: d.textColor || "#111827",
                              fontWeight: "bold",
                            }}
                          >
                            &ldquo;{d.customText}&rdquo;
                          </span>
                        </div>
                      )}
                      <div className="flex gap-4 text-[11px] text-slate-500">
                        {d.fontFamily && <span>Font: {d.fontFamily}</span>}
                        {d.textColor && (
                          <span className="flex items-center gap-1">
                            Màu:{" "}
                            <span
                              className="w-3 h-3 rounded-full border border-slate-300 inline-block"
                              style={{ backgroundColor: d.textColor }}
                            />
                            {d.textColor}
                          </span>
                        )}
                      </div>
                      {d.customImageUrl && (
                        <div className="pt-1">
                          <a
                            href={d.customImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 hover:underline font-medium"
                          >
                            <ExternalLink size={12} />
                            <span>Xem / Tải file ảnh khách tải lên</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status Changer */}
                  <div className="flex flex-col gap-2 shrink-0 sm:min-w-[160px]">
                    <label className="text-[11px] font-semibold text-slate-500">Đổi trạng thái:</label>
                    <select
                      value={d.status}
                      onChange={(e) => updateStatus(d.id, e.target.value)}
                      className="text-xs p-2 border border-slate-300 rounded-lg outline-none bg-white font-medium"
                    >
                      <option value="DRAFT">Bản nháp</option>
                      <option value="READY_FOR_PRODUCTION">Sẵn sàng sản xuất</option>
                      <option value="IN_PRODUCTION">Đang in / Chế tác</option>
                      <option value="COMPLETED">Hoàn tất</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
