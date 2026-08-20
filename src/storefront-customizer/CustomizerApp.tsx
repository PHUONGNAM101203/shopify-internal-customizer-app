import React, { useState, useEffect } from "react";

interface CustomizerAppProps {
  productId: string;
  variantId: string;
  shopDomain: string;
  proxyUrl: string;
  blockTitle?: string;
  btnText?: string;
  primaryColor?: string;
}

interface LeatherOption {
  id: string;
  name: string;
  color: string;
  extraPrice: number;
}

interface BuckleOption {
  id: string;
  name: string;
  color: string;
  extraPrice: number;
}

const LEATHER_MATERIALS: LeatherOption[] = [
  { id: "buttero-black", name: "Black Buttero (Italy)", color: "#171717", extraPrice: 0 },
  { id: "buttero-tan", name: "Classic Tan Buttero", color: "#B45309", extraPrice: 5 },
  { id: "cordovan-burgundy", name: "Burgundy Cordovan", color: "#831843", extraPrice: 15 },
  { id: "pueblo-olive", name: "Olive Pueblo Leather", color: "#3F6212", extraPrice: 10 },
  { id: "epsom-navy", name: "Navy Blue Epsom", color: "#1E3A8A", extraPrice: 8 },
];

const BUCKLE_OPTIONS: BuckleOption[] = [
  { id: "matte-black", name: "Matte Black PVD", color: "#262626", extraPrice: 0 },
  { id: "brushed-silver", name: "Brushed 316L Silver", color: "#D1D5DB", extraPrice: 0 },
  { id: "rose-gold", name: "18K Rose Gold Finish", color: "#FBCFE8", extraPrice: 12 },
  { id: "vintage-brass", name: "Antiqued Brass", color: "#CA8A04", extraPrice: 8 },
];

const LUG_WIDTHS = ["18 mm", "20 mm", "22 mm", "24 mm"];
const STITCH_COLORS = ["Ton-sur-Ton (Matching)", "White Linen", "Gold Thread", "Crimson Red"];
const FONTS = ["Roboto", "Montserrat", "Playfair Display", "Dancing Script", "Pacifico"];

export const CustomizerApp: React.FC<CustomizerAppProps> = ({
  productId,
  variantId: initialVariantId,
  shopDomain,
  proxyUrl,
  blockTitle = "🎨 Tùy Chỉnh Thiết Kế (Wild & King Bespoke)",
  btnText = "Thêm vào giỏ hàng với thiết kế này",
  primaryColor = "#008060",
}) => {
  const [variantId, setVariantId] = useState(initialVariantId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Customizer State
  const [selectedLeather, setSelectedLeather] = useState<LeatherOption>(LEATHER_MATERIALS[0]);
  const [selectedBuckle, setSelectedBuckle] = useState<BuckleOption>(BUCKLE_OPTIONS[0]);
  const [selectedWidth, setSelectedWidth] = useState<string>(LUG_WIDTHS[1]);
  const [selectedStitch, setSelectedStitch] = useState<string>(STITCH_COLORS[0]);
  const [customText, setCustomText] = useState("WILD & KING");
  const [selectedFont, setSelectedFont] = useState("Montserrat");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Calculate Extra Custom Price
  const totalExtraPrice = selectedLeather.extraPrice + selectedBuckle.extraPrice;

  // Listen to Shopify Theme Variant changes
  useEffect(() => {
    const handleVariantChange = (e: any) => {
      if (e.detail?.variant?.id) {
        setVariantId(String(e.detail.variant.id));
      }
    };
    document.addEventListener("variant:changed", handleVariantChange);
    return () => document.removeEventListener("variant:changed", handleVariantChange);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Add to Cart via Shopify Cart Ajax API
  const handleAddToCart = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const designPayload = {
        productId,
        variantId,
        customText,
        fontFamily: selectedFont,
        textColor,
        customImageUrl: uploadedImage,
        rawDesignData: JSON.stringify({
          leather: selectedLeather.name,
          buckle: selectedBuckle.name,
          width: selectedWidth,
          stitch: selectedStitch,
          engraving: customText,
          font: selectedFont,
          extraPrice: totalExtraPrice,
        }),
      };

      // 1. Lưu cấu hình thiết kế về Next.js backend qua App Proxy
      const proxyRes = await fetch(`${proxyUrl}/save-design?shop=${encodeURIComponent(shopDomain)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(designPayload),
      });

      let designId = "dsg_" + Date.now();
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data.designId) designId = data.designId;
      }

      // 2. Thêm vào Cart với line item properties
      const cartRes = await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              id: variantId,
              quantity: 1,
              properties: {
                "_custom_design_id": designId,
                "Leather Material": selectedLeather.name,
                "Buckle Type": selectedBuckle.name,
                "Lug Width": selectedWidth,
                "Stitching": selectedStitch,
                ...(customText ? { "Laser Engraving": `"${customText}" (${selectedFont})` } : {}),
                ...(totalExtraPrice > 0 ? { "Custom Fee": `+$${totalExtraPrice}` } : {}),
              },
            },
          ],
        }),
      });

      if (!cartRes.ok) {
        const errData = await cartRes.json();
        throw new Error(errData.description || "Không thể thêm vào giỏ hàng");
      }

      setSuccessMessage("🎉 Đã thêm thiết kế thủ công vào giỏ hàng!");
      setTimeout(() => {
        window.location.href = "/cart";
      }, 800);
    } catch (err: any) {
      setError(err.message || "Lỗi khi thêm vào giỏ hàng");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="spc-container" style={{ fontFamily: "inherit" }}>
      {/* Header */}
      <div className="spc-header">
        <span>{blockTitle}</span>
        {totalExtraPrice > 0 && (
          <span style={{ fontSize: "0.85rem", color: primaryColor, fontWeight: 700 }}>
            (+${totalExtraPrice.toFixed(2)} phụ phí bespoke)
          </span>
        )}
      </div>

      {/* Interactive Mockup Canvas */}
      <div
        className="spc-preview-card"
        style={{
          backgroundColor: selectedLeather.color,
          transition: "background-color 0.3s ease",
          position: "relative",
          minHeight: "260px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "14px",
          border: `3px solid ${selectedBuckle.color}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          padding: "1.5rem",
        }}
      >
        <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "1px" }}>
          {selectedLeather.name} &bull; {selectedWidth}
        </div>

        {customText && (
          <div
            style={{
              fontFamily: selectedFont,
              color: textColor,
              fontSize: "1.4rem",
              fontWeight: "bold",
              letterSpacing: "1.5px",
              textAlign: "center",
              textShadow: "0 2px 4px rgba(0,0,0,0.6)",
              padding: "0.5rem 1rem",
              border: "1px dashed rgba(255,255,255,0.3)",
              borderRadius: "8px",
            }}
          >
            {customText}
          </div>
        )}

        <div style={{ marginTop: "0.75rem", fontSize: "0.7rem", color: "#E5E7EB", background: "rgba(0,0,0,0.4)", padding: "3px 8px", borderRadius: "12px" }}>
          Khóa: {selectedBuckle.name} &bull; Chỉ: {selectedStitch}
        </div>
      </div>

      {/* Step 1: Chọn Chất Liệu Da (Leather) */}
      <div className="spc-control-group">
        <label className="spc-label">1. Chọn Loại Da Cao Cấp (Leather):</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.5rem" }}>
          {LEATHER_MATERIALS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setSelectedLeather(l)}
              style={{
                padding: "0.5rem",
                borderRadius: "8px",
                border: selectedLeather.id === l.id ? `2px solid ${primaryColor}` : "1px solid #E5E7EB",
                background: selectedLeather.id === l.id ? "#F0FDF4" : "#FFFFFF",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: l.color, border: "1px solid #D1D5DB" }} />
              <div style={{ fontSize: "0.75rem", lineHeight: "1.2" }}>
                <div style={{ fontWeight: 600 }}>{l.name}</div>
                {l.extraPrice > 0 && <div style={{ color: "#059669", fontSize: "0.7rem" }}>+${l.extraPrice}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Chọn Loại Khóa (Buckle) */}
      <div className="spc-control-group">
        <label className="spc-label">2. Kiểu Khóa & Hardware (Buckle):</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.5rem" }}>
          {BUCKLE_OPTIONS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBuckle(b)}
              style={{
                padding: "0.5rem",
                borderRadius: "8px",
                border: selectedBuckle.id === b.id ? `2px solid ${primaryColor}` : "1px solid #E5E7EB",
                background: selectedBuckle.id === b.id ? "#F0FDF4" : "#FFFFFF",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ width: "16px", height: "16px", borderRadius: "4px", backgroundColor: b.color, border: "1px solid #9CA3AF" }} />
              <div style={{ fontSize: "0.75rem", lineHeight: "1.2" }}>
                <div style={{ fontWeight: 600 }}>{b.name}</div>
                {b.extraPrice > 0 && <div style={{ color: "#059669", fontSize: "0.7rem" }}>+${b.extraPrice}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Kích thước Lug Width & Màu Chỉ Khâu */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div className="spc-control-group">
          <label className="spc-label">3. Size / Bề Rộng (Lug Width):</label>
          <select
            value={selectedWidth}
            onChange={(e) => setSelectedWidth(e.target.value)}
            className="spc-input"
            style={{ padding: "0.5rem" }}
          >
            {LUG_WIDTHS.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="spc-control-group">
          <label className="spc-label">4. Màu Chỉ Khâu (Stitching):</label>
          <select
            value={selectedStitch}
            onChange={(e) => setSelectedStitch(e.target.value)}
            className="spc-input"
            style={{ padding: "0.5rem" }}
          >
            {STITCH_COLORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Step 4: Khắc Tên Laser Cá Nhân Hóa (Laser Engraving) */}
      <div className="spc-control-group">
        <label className="spc-label">5. Khắc Laser Tên / Slogan Cá Nhân Hóa:</label>
        <input
          type="text"
          className="spc-input"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Nhập tên, ngày kỷ niệm hoặc chữ ký..."
          maxLength={35}
        />
      </div>

      {/* Font Selector */}
      <div className="spc-control-group">
        <label className="spc-label">Font Chữ Khắc:</label>
        <div className="spc-font-grid">
          {FONTS.map((font) => (
            <button
              key={font}
              type="button"
              className={`spc-font-btn ${selectedFont === font ? "active" : ""}`}
              style={{ fontFamily: font }}
              onClick={() => setSelectedFont(font)}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ color: "#dc2626", fontSize: "0.85rem", padding: "0.5rem", background: "#fef2f2", borderRadius: "6px" }}>
          ⚠️ {error}
        </div>
      )}
      {successMessage && (
        <div style={{ color: "#16a34a", fontSize: "0.85rem", padding: "0.5rem", background: "#f0fdf4", borderRadius: "6px" }}>
          {successMessage}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        className="spc-submit-btn"
        style={{ backgroundColor: primaryColor }}
        onClick={handleAddToCart}
        disabled={submitting}
      >
        {submitting ? "Đang lưu cấu hình & thêm giỏ hàng..." : `${btnText} ${totalExtraPrice > 0 ? `(+$${totalExtraPrice})` : ""}`}
      </button>
    </div>
  );
};
