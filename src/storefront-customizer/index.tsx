import React from "react";
import { createRoot } from "react-dom/client";
import { CustomizerApp } from "./CustomizerApp";

function initCustomizer() {
  const rootElement = document.getElementById("product-customizer-root");
  if (!rootElement) return;

  // Prevent multiple mountings
  if (rootElement.dataset.mounted === "true") return;
  rootElement.dataset.mounted = "true";

  const productId = rootElement.getAttribute("data-product-id") || "";
  const variantId = rootElement.getAttribute("data-selected-variant-id") || "";
  const shopDomain = rootElement.getAttribute("data-shop-domain") || window.location.hostname;
  const proxyUrl = rootElement.getAttribute("data-app-proxy-url") || "/apps/customizer";
  const blockTitle = rootElement.getAttribute("data-block-title") || undefined;
  const btnText = rootElement.getAttribute("data-btn-text") || undefined;
  const primaryColor = rootElement.getAttribute("data-primary-color") || undefined;

  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <CustomizerApp
        productId={productId}
        variantId={variantId}
        shopDomain={shopDomain}
        proxyUrl={proxyUrl}
        blockTitle={blockTitle}
        btnText={btnText}
        primaryColor={primaryColor}
      />
    </React.StrictMode>
  );
}

// Ensure execution after DOM loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCustomizer);
} else {
  initCustomizer();
}

// Support Shopify Theme Section re-renders in Theme Customizer
document.addEventListener("shopify:section:load", initCustomizer);
