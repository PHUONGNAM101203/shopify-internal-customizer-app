"use client";

import React, { useState, useEffect } from "react";
import { Plus, Check, Trash2, Edit3, Image, Type, Palette, DollarSign, Save } from "lucide-react";

interface ProductConfig {
  id?: string;
  shop?: string;
  shopifyProductId: string;
  productTitle: string;
  isEnabled: boolean;
  allowCustomText: boolean;
  allowImageUpload: boolean;
  allowColorPicker: boolean;
  availableFonts: string[];
  availableColors: string[];
  baseMockupUrl?: string;
  extraPrice: number;
}

const DEFAULT_FONTS = ["Roboto", "Montserrat", "Playfair Display", "Dancing Script", "Pacifico"];
const DEFAULT_COLORS = ["#111827", "#DC2626", "#2563EB", "#16A34A", "#D97706", "#FFFFFF"];

export default function AdminProductsPage() {
  const [configs, setConfigs] = useState<ProductConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form State
  const [productId, setProductId] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [allowText, setAllowText] = useState(true);
  const [allowImage, setAllowImage] = useState(true);
  const [allowColor, setAllowColor] = useState(true);
  const [fonts, setFonts] = useState<string[]>(DEFAULT_FONTS);
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const [mockupUrl, setMockupUrl] = useState("");
  const [extraPrice, setExtraPrice] = useState("0");
  const [newFontInput, setNewFontInput] = useState("");
  const [newColorInput, setNewColorInput] = useState("#000000");

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs || []);
      }
    } catch (err) {
      console.error("Error fetching configs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !productTitle) {
      alert("Vui lòng nhập Shopify Product ID và Tên sản phẩm");
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      const payload: ProductConfig = {
        shopifyProductId: productId,
        productTitle,
        isEnabled,
        allowCustomText: allowText,
        allowImageUpload: allowImage,
        allowColorPicker: allowColor,
        availableFonts: fonts,
        availableColors: colors,
        baseMockupUrl: mockupUrl || undefined,
        extraPrice: parseFloat(extraPrice) || 0,
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage("✅ Đã lưu cấu hình sản phẩm thành công!");
        fetchConfigs();
      } else {
        const err = await res.json();
        alert("Lỗi: " + err.error);
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c: ProductConfig) => {
    setProductId(c.shopifyProductId);
    setProductTitle(c.productTitle);
    setIsEnabled(c.isEnabled);
    setAllowText(c.allowCustomText);
    setAllowImage(c.allowImageUpload);
    setAllowColor(c.allowColorPicker);
    setFonts(c.availableFonts);
    setColors(c.availableColors);
    setMockupUrl(c.baseMockupUrl || "");
    setExtraPrice(String(c.extraPrice || 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addFont = () => {
    if (newFontInput && !fonts.includes(newFontInput)) {
      setFonts([...fonts, newFontInput.trim()]);
      setNewFontInput("");
    }
  };

  const removeFont = (fontToRemove: string) => {
    setFonts(fonts.filter((f) => f !== fontToRemove));
  };

  const addColor = () => {
    if (newColorInput && !colors.includes(newColorInput)) {
      setColors([...colors, newColorInput]);
    }
  };

  const removeColor = (colorToRemove: string) => {
    setColors(colors.filter((c) => c !== colorToRemove));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cấu Hình Sản Phẩm Tùy Chỉnh</h1>
        <p className="text-xs text-slate-500 mt-1">
          Thiết lập các tùy chọn in ấn/khắc tên và mockup mẫu cho từng sản phẩm trên Shopify Storefront
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 font-medium">
          {message}
        </div>
      )}

      {/* Product Config Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Edit3 size={16} className="text-emerald-600" />
          <span>Thông tin Cấu hình Sản phẩm</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shopify Product ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: 8593452391234 (lấy từ Shopify Admin)"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên Sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Áo Thun In Tên / Bình Giữ Nhiệt Khắc Laser"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL Ảnh Mockup Phôi Mẫu (Base Mockup)
            </label>
            <input
              type="url"
              placeholder="https://cdn.shopify.com/.../mockup-blank.png"
              value={mockupUrl}
              onChange={(e) => setMockupUrl(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phí tùy chỉnh phụ thu ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={extraPrice}
              onChange={(e) => setExtraPrice(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Feature Switches */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-3">Tính năng cho phép:</label>
          <div className="flex flex-wrap gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="font-medium text-slate-700">Kích hoạt Customizer</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowText}
                onChange={(e) => setAllowText(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="font-medium text-slate-700">Cho phép nhập Text</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowColor}
                onChange={(e) => setAllowColor(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="font-medium text-slate-700">Bảng chọn màu</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowImage}
                onChange={(e) => setAllowImage(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="font-medium text-slate-700">Cho phép Upload Logo/Ảnh</span>
            </label>
          </div>
        </div>

        {/* Fonts Palette */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Danh sách Font Chữ:</label>
          <div className="flex flex-wrap gap-2">
            {fonts.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 text-xs rounded-md border border-slate-200"
              >
                <span>{f}</span>
                <button type="button" onClick={() => removeFont(f)} className="text-slate-400 hover:text-red-600">
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 max-w-sm mt-2">
            <input
              type="text"
              placeholder="Tên font (vd: Pacifico)"
              value={newFontInput}
              onChange={(e) => setNewFontInput(e.target.value)}
              className="text-xs p-2 border border-slate-300 rounded-lg flex-1 outline-none"
            />
            <button
              type="button"
              onClick={addFont}
              className="px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-900"
            >
              Thêm Font
            </button>
          </div>
        </div>

        {/* Colors Palette */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Bảng Màu Sắc:</label>
          <div className="flex flex-wrap gap-2 items-center">
            {colors.map((c) => (
              <div key={c} className="relative group">
                <span
                  className="w-7 h-7 rounded-full border border-slate-300 inline-block shadow-inner"
                  style={{ backgroundColor: c }}
                  title={c}
                />
                <button
                  type="button"
                  onClick={() => removeColor(c)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 items-center max-w-xs mt-2">
            <input
              type="color"
              value={newColorInput}
              onChange={(e) => setNewColorInput(e.target.value)}
              className="w-9 h-8 p-0 border border-slate-300 rounded cursor-pointer"
            />
            <button
              type="button"
              onClick={addColor}
              className="px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-900"
            >
              Thêm Màu Này
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Save size={15} />
            <span>{saving ? "Đang lưu..." : "Lưu Cấu Hình"}</span>
          </button>
        </div>
      </form>

      {/* Configured Products List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Danh sách Sản phẩm đã Cấu hình ({configs.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Đang tải danh sách...</div>
        ) : configs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Chưa có sản phẩm nào được cấu hình. Hãy điền form bên trên để thêm sản phẩm đầu tiên!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {configs.map((c) => (
              <div key={c.id || c.shopifyProductId} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{c.productTitle}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.isEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {c.isEnabled ? "Kích hoạt" : "Tạm ẩn"}
                    </span>
                  </div>
                  <div className="text-slate-500 flex gap-4">
                    <span>ID: {c.shopifyProductId}</span>
                    <span>Fonts: {c.availableFonts.length}</span>
                    <span>Colors: {c.availableColors.length}</span>
                    {c.extraPrice > 0 && <span className="text-emerald-700 font-medium">+${c.extraPrice}</span>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleEdit(c)}
                  className="px-3 py-1.5 border border-slate-200 hover:border-emerald-600 hover:text-emerald-600 rounded-md font-medium text-slate-700 transition-colors"
                >
                  Sửa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
