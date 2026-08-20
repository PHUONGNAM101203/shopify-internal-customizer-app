import "@shopify/shopify-api/adapters/node";
import { shopifyApi, ApiVersion, LogSeverity } from "@shopify/shopify-api";

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || "local_dev_key",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "local_dev_secret",
  scopes: (process.env.SCOPES || "read_products,write_products,read_orders,write_orders").split(","),
  hostName: (process.env.SHOPIFY_APP_URL || "http://localhost:3000").replace(/^https?:\/\//, ""),
  apiVersion: ApiVersion.October24,
  isEmbeddedApp: true,
  logger: {
    level: process.env.NODE_ENV === "development" ? LogSeverity.Info : LogSeverity.Error,
  },
});

/**
 * Execute GraphQL query against Shopify Admin API
 */
export async function executeShopifyGraphQL(shop: string, accessToken: string, query: string, variables?: any) {
  const response = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify GraphQL Error: ${response.statusText}`);
  }

  return response.json();
}
