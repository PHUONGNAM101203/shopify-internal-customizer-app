export interface OptionValue {
  id: string;
  name: string;
  code: string;
  colorHex?: string;
  imageUrl?: string;
  extraPrice: number;
  inStock: boolean;
  metadata?: Record<string, any>;
}

export interface OptionGroup {
  id: string;
  name: string;
  type: "LEATHER" | "BUCKLE" | "SIZE" | "STITCH" | "ENGRAVING" | "CUSTOM";
  required: boolean;
  defaultValueId?: string;
  values: OptionValue[];
}

export interface CompatibilityRule {
  id: string;
  ifOptionValueId: string;
  thenDisallowOptionValueIds: string[];
  reason?: string;
}

export interface PriceRule {
  id: string;
  name: string;
  conditionOptionValueIds: string[];
  additionalPrice: number;
}

export interface ProductCustomizerConfig {
  id: string;
  shopifyProductId: string;
  productTitle: string;
  basePrice: number;
  baseMockupUrl?: string;
  groups: OptionGroup[];
  compatibilityRules: CompatibilityRule[];
  priceRules: PriceRule[];
  isEnabled: boolean;
}
