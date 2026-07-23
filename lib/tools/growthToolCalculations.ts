export function toLatinNumber(value: string): number {
  const normalized = value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[^\d.]/g, "");
  return Number(normalized) || 0;
}

export function buildGoogleReviewUrl(value: string): string | null {
  const input = value.trim();
  if (!input) return null;
  if (/^https?:\/\//i.test(input)) {
    try {
      return new URL(input).toString();
    } catch {
      return null;
    }
  }
  // Google Place IDs are long opaque tokens; reject short free-text.
  if (/^ChIJ[\w-]{10,}$/i.test(input) || /^[\w-]{20,}$/i.test(input)) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(input)}`;
  }
  return null;
}

export function calculateSeoRoi({
  customerValue,
  monthlyLeads,
  closeRatePercent,
  marginPercent,
  seoCost,
}: {
  customerValue: number;
  monthlyLeads: number;
  closeRatePercent: number;
  marginPercent: number;
  seoCost: number;
}) {
  const closeRate = Math.min(Math.max(closeRatePercent, 0), 100) / 100;
  const profitMargin = Math.min(Math.max(marginPercent, 0), 100) / 100;
  const profitPerCustomer = Math.max(customerValue, 0) * profitMargin;
  const expectedCustomers = Math.max(monthlyLeads, 0) * closeRate;
  const grossProfit = expectedCustomers * profitPerCustomer;
  const cost = Math.max(seoCost, 0);
  const netProfit = grossProfit - cost;
  const roi = cost > 0 ? (netProfit / cost) * 100 : 0;
  const breakEvenLeads =
    closeRate > 0 && profitPerCustomer > 0
      ? Math.ceil(cost / (closeRate * profitPerCustomer))
      : 0;

  return {
    customerValue: Math.max(customerValue, 0),
    monthlyLeads: Math.max(monthlyLeads, 0),
    closeRate,
    profitMargin,
    cost,
    expectedCustomers,
    grossProfit,
    netProfit,
    roi,
    breakEvenLeads,
  };
}
