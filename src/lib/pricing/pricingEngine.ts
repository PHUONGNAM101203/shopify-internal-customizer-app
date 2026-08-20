import { db } from "@/lib/db";

export interface PricingResult {
  valid: boolean;
  errors: string[];
  basePrice: number;
  extraPrice: number;
  totalPrice: number;
  breakdown: Array<{ label: string; amount: number }>;
  selectionsDetail: Array<{ groupName: string; valueName: string; extraPrice: number }>;
}

/**
 * Server-Side Pricing Engine
 * Validates selected option values against database and calculates accurate pricing securely.
 */
export async function calculateServerPrice(
  configId: string,
  selectedValues: Record<string, string> // groupId -> valueId (or code)
): Promise<PricingResult> {
  const config = await db.productConfig.findUnique({
    where: { id: configId },
    include: {
      optionGroups: {
        include: {
          values: true,
        },
      },
      compatibilityRules: true,
      priceRules: true,
    },
  });

  if (!config) {
    return {
      valid: false,
      errors: ["Không tìm thấy cấu hình sản phẩm (Invalid Config ID)"],
      basePrice: 0,
      extraPrice: 0,
      totalPrice: 0,
      breakdown: [],
      selectionsDetail: [],
    };
  }

  const errors: string[] = [];
  let extraPrice = 0;
  const breakdown: Array<{ label: string; amount: number }> = [];
  const selectionsDetail: Array<{ groupName: string; valueName: string; extraPrice: number }> = [];
  const chosenValueIds: string[] = [];

  for (const group of config.optionGroups) {
    const selectedValIdOrCode = selectedValues[group.id] || selectedValues[group.name];
    if (group.required && !selectedValIdOrCode) {
      errors.push(`Vui lòng chọn mục: ${group.name}`);
      continue;
    }

    if (selectedValIdOrCode) {
      const matchValue = group.values.find(
        (v) => v.id === selectedValIdOrCode || v.code === selectedValIdOrCode || v.name === selectedValIdOrCode
      );

      if (!matchValue) {
        errors.push(`Tùy chọn không hợp lệ cho ${group.name}`);
        continue;
      }

      chosenValueIds.push(matchValue.id);

      if (matchValue.extraPrice > 0) {
        extraPrice += matchValue.extraPrice;
        breakdown.push({
          label: `${group.name}: ${matchValue.name}`,
          amount: matchValue.extraPrice,
        });
      }

      selectionsDetail.push({
        groupName: group.name,
        valueName: matchValue.name,
        extraPrice: matchValue.extraPrice,
      });
    }
  }

  // Check compatibility rules
  for (const rule of config.compatibilityRules) {
    if (chosenValueIds.includes(rule.ifOptionValueId)) {
      try {
        const disallowed = JSON.parse(rule.thenDisallowOptionValueIds || "[]");
        for (const disId of disallowed) {
          if (chosenValueIds.includes(disId)) {
            errors.push(rule.reason || "Cặp tùy chọn không tương thích với nhau");
          }
        }
      } catch {}
    }
  }

  const totalPrice = config.basePrice + extraPrice;

  return {
    valid: errors.length === 0,
    errors,
    basePrice: config.basePrice,
    extraPrice,
    totalPrice,
    breakdown,
    selectionsDetail,
  };
}
