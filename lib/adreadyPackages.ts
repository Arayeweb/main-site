export const ADREADY_PACKAGES = {
  monthly: {
    id: "monthly",
    name: "انتشار یک‌ماهه",
    priceToman: 1_500_000,
    listPriceToman: 1_500_000,
    durationDays: 30,
    plan: "monthly",
  },
  lifetime: {
    id: "lifetime",
    name: "انتشار مادام‌العمر",
    priceToman: 3_100_000,
    listPriceToman: 6_200_000,
    durationDays: null,
    plan: "lifetime",
  },
} as const;

export type AdReadyPackageKey = keyof typeof ADREADY_PACKAGES;

export function isAdReadyPackageKey(value: unknown): value is AdReadyPackageKey {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(ADREADY_PACKAGES, value)
  );
}

export function getAdReadyExpiry(
  packageKey: AdReadyPackageKey,
  paidAt = new Date(),
  currentExpiry?: string | null
): string | null {
  const pkg = ADREADY_PACKAGES[packageKey];
  if (pkg.durationDays === null) return null;

  const existing = currentExpiry ? new Date(currentExpiry) : null;
  const startsAt =
    existing && !Number.isNaN(existing.getTime()) && existing > paidAt
      ? existing
      : paidAt;
  return new Date(
    startsAt.getTime() + pkg.durationDays * 24 * 60 * 60 * 1000
  ).toISOString();
}

export function formatToman(amount: number): string {
  return new Intl.NumberFormat("fa-IR").format(amount);
}
