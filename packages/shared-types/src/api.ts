import { ProductCustomizerConfig } from "./config";
import { CustomDesignPayload } from "./design";

export interface ValidateCartRequest {
  configId: string;
  variantId: string;
  selections: Record<string, string>;
  engravingText?: string;
  engravingFont?: string;
}

export interface ValidateCartResponse {
  valid: boolean;
  errors?: string[];
  calculatedExtraPrice: number;
  designId?: string;
  summaryProperties?: Record<string, string>;
}

export interface GetConfigResponse {
  config: ProductCustomizerConfig | null;
}

export interface CreateDesignResponse {
  success: boolean;
  designId: string;
  previewUrl?: string;
}
