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

interface ProductConfig {
  isEnabled: boolean;
  allowCustomText: boolean;
  allowImageUpload: boolean;
  allowColorPicker: boolean;
  availableFonts: string[];
  availableColors: string[];
  baseMockupUrl?: string;
  extraPrice: number;
}

export const CustomizerApp: React.FC<CustomizerAppProps> = ({
  productId,
  variantId: initialVariantId,
  shopDomain,
  proxyUrl,
  blockTitle = "🎨 Tùy Chỉnh Thiết Kế Sản Phẩm",
  btnText = "Thêm vào giỏ hàng với thiết kế này",
  primaryColor = "#008060",
}) => {
  const [variantId, setVariantId] = useState(initialVariantId);
  const [config, setConfig] = useState<ProductConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Customizer State
  const [customText, setCustomText] = useState("Your Name / Slogan");
  const [selectedFont, setSelectedFont] = useState("Roboto");
  const [selectedColor, setSelectedColor] = useState("#111827");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(24);

  // Fetch product config via App Proxy
  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        // Request config through Shopify App Proxy route
        const url = `${proxyUrl}/customizer-config?productId=${encodeURIComponent(productId)}&shop=${encodeURIComponent(shopDomain)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setConfig(data.config);
            if (data.config.availableFonts?.length) setSelectedFont(data.config.availableFonts[0]);
            if (data.config.availableColors?.length) setSelectedColor(data.config.availableColors[0]);
          }
        } else {
          // Fallback default config if DB config not set yet
          setConfig({
            isEnabled: true,
            allowCustomText: true,
            allowImageUpload: true,
            allowColorPicker: true,
            availableFonts: ["Roboto", "Montserrat", "Playfair Display", "Dancing Script", "Pacifico"],
            availableColors: ["#111827", "#DC2626", "#2563EB", "#16A34A", "#D97706", "#FFFFFF"],
            extraPrice: 0,
          });
        }
      } catch (err) {
        console.warn("App proxy config fallback to default:", err);
        setConfig({
          isEnabled: true,
          allowCustomText: true,
          allowImageUpload: true,
          allowColorPicker: true,
          availableFonts: ["Roboto", "Montserrat", "Playfair Display", "Dancing Script", "Pacifico"],
          availableColors: ["#111827", "#DC2626", "#2563EB", "#16A34A", "#D97706", "#FFFFFF"],
          extraPrice: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    loadConfig();

    // Listen to theme variant changes
    const handleVariantChange = (e: any) => {
      if (e.detail && e.detail.variant && e.detail.variant.id) {
        setVariantId(String(e.detail.variant.id));
      }
    };
    document.addEventListener("variant:changed", handleVariantChange);
    return () => document.removeEventListener("variant:changed", handleVariantChange);
  }, [productId, shopDomain, proxyUrl]);

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Add to Cart with line item properties
  const handleAddToCart = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // 1. Lưu design state về Next.js backend qua App Proxy
      const designPayload = {
        productId,
        variantId,
        customText,
        fontFamily: selectedFont,
        textColor: selectedColor,
        customImageUrl: uploadedImage,
        previewImageUrl: uploadedImage || null,
        rawDesignData: JSON.stringify({
          text: customText,
          font: selectedFont,
          color: selectedColor,
          fontSize,
          timestamp: new Date().toISOString(),
        }),
      };

      const proxyRes = await fetch(`${proxyUrl}/save-design?shop=${encodeURIComponent(shopDomain)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(designPayload),
      });

      let designId = "offline-" + Date.now();
      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        if (proxyData.designId) {
          designId = proxyData.designId;
        }
      }

      // 2. Gọi Shopify Cart Ajax API (/cart/add.js)
      // Thuộc tính có tiền tố "_" (vd: _custom_design_id) sẽ tự động ẩn trên hóa đơn của khách nhưng backend/admin đọc được
      const cartResponse = await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              id: variantId,
              quantity: 1,
              properties: {
                "Custom Text": customText,
                "Font": selectedFont,
                "Color": selectedColor,
                "_custom_design_id": designId,
                "_preview_url": uploadedImage ? "Custom Clipart Attached" : "Text Customization",
              },
            },
          ],
        }),
      });

      if (!cartResponse.ok) {
        const errData = await cartResponse.json();
        throw new Error(errData.description || "Không thể thêm vào giỏ hàng");
      }

      setSuccessMessage("🎉 Đã thêm sản phẩm tùy chỉnh vào giỏ hàng thành công!");

      // Tự động mở giỏ hàng hoặc chuyển hướng
      setTimeout(() => {
        window.location.href = "/cart";
      }, 800);
    } catch (err: any) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err);
      setError(err.message || "Đã xảy ra lỗi khi thêm vào giỏ hàng.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="customizer-loading-state">
        <div className="customizer-spinner" />
        <span>Đang khởi tạo trình tùy chỉnh...</span>
      </div>
    );
  }

  if (config && !config.isEnabled) {
    return null;
  }

  return (
    <div className="spc-container">
      <div className="spc-header">
        <span>{blockTitle}</span>
        {config?.extraPrice ? (
          <span style={{ fontSize: "0.85rem", color: primaryColor }}>
            (+${config.extraPrice.toFixed(2)} phí tùy chỉnh)
          </span>
        ) : null}
      </div>

      {/* Live Mockup Preview Canvas */}
      <div className="spc-preview-card">
        {config?.baseMockupUrl && (
          <img
            src={config.baseMockupUrl}
            alt="Base Mockup"
            className="spc-preview-mockup"
          />
        )}
        
        {uploadedImage && (
          <img
            src={uploadedImage}
            alt="Custom upload"
            style={{
              maxWidth: "60%",
              maxHeight: "60%",
              objectFit: "contain",
              zIndex: 5,
            }}
          />
        )}

        {customText && (
          <div
            className="spc-preview-text-overlay"
            style={{
              fontFamily: selectedFont,
              color: selectedColor,
              fontSize: `${fontSize}px`,
            }}
          >
            {customText}
          </div>
        )}
      </div>

      {/* Control: Custom Text */}
      {config?.allowCustomText && (
        <div className="spc-control-group">
          <label className="spc-label">Nội dung in/khắc (Custom Text):</label>
          <input
            type="text"
            className="spc-input"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Nhập tên, ngày kỷ niệm hoặc slogan..."
            maxLength={60}
          />
        </div>
      )}

      {/* Control: Font Selector */}
      {config?.availableFonts && config.availableFonts.length > 0 && (
        <div className="spc-control-group">
          <label className="spc-label">Chọn Font Chữ:</label>
          <div className="spc-font-grid">
            {config.availableFonts.map((font) => (
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
      )}

      {/* Control: Color Selector */}
      {config?.allowColorPicker && config.availableColors && config.availableColors.length > 0 && (
        <div className="spc-control-group">
          <label className="spc-label">Chọn Màu Sắc:</label>
          <div className="spc-color-row">
            {config.availableColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`spc-color-circle ${selectedColor === color ? "active" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Control: Image / Logo Upload */}
      {config?.allowImageUpload && (
        <div className="spc-control-group">
          <label className="spc-label">Tải lên Logo hoặc Hình ảnh (PNG/JPG):</label>
          <input
            type="file"
            accept="image/*"
            className="spc-input"
            onChange={handleImageUpload}
          />
          {uploadedImage && (
            <button
              type="button"
              onClick={() => setUploadedImage(null)}
              style={{
                background: "none",
                border: "none",
                color: "#dc2626",
                fontSize: "0.8rem",
                cursor: "pointer",
                textAlign: "left",
                marginTop: "0.25rem",
              }}
            >
              ✕ Xóa ảnh đã chọn
            </button>
          )}
        </div>
      )}

      {/* Error & Success Alerts */}
      {error && (
        <div style={{ color: "#dc2626", fontSize: "0.875rem", padding: "0.5rem", background: "#fef2f2", borderRadius: "6px" }}>
          ⚠️ {error}
        </div>
      )}

      {successMessage && (
        <div style={{ color: "#16a34a", fontSize: "0.875rem", padding: "0.5rem", background: "#f0fdf4", borderRadius: "6px" }}>
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
        {submitting ? (
          <>
            <div className="customizer-spinner" style={{ borderTopColor: "#ffffff" }} />
            <span>Đang lưu thiết kế & thêm vào giỏ...</span>
          </>
        ) : (
          btnText
        )}
      </button>
    </div>
  );
};
