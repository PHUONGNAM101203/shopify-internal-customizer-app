export interface CustomDesignSelection {
  groupId: string;
  groupName: string;
  valueId: string;
  valueName: string;
  extraPrice: number;
}

export interface CustomDesignInput {
  configId: string;
  productId: string;
  variantId: string;
  selections: Record<string, string>; // groupId -> valueId
  engravingText?: string;
  engravingFont?: string;
  customLogoUrl?: string;
  previewUrl?: string;
}

export interface CustomDesignPayload {
  id: string; // dsg_xxxx
  configId: string;
  productId: string;
  variantId: string;
  selections: CustomDesignSelection[];
  engraving?: {
    text: string;
    font: string;
    color?: string;
  };
  pricing: {
    basePrice: number;
    extraPrice: number;
    totalPrice: number;
    breakdown: Array<{ label: string; amount: number }>;
  };
  previewUrl?: string;
  shopifyOrderId?: string;
  shopifyOrderNumber?: string;
  status: "DRAFT" | "ORDERED" | "IN_PRODUCTION" | "QC" | "SHIPPED";
  createdAt: string;
}
