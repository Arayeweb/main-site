// =========================================================
// Telegram credit packages — unified with web AI_PACKAGES
// =========================================================

import { PACKAGE_LIST, formatPriceToman } from "@/lib/aiPackages";

export interface TelegramPackage {
  id: string;
  name: string;
  priceToman: number;
  credits: number;
}

/** Legacy package IDs from pre-unification telegram orders */
const LEGACY_PACKAGE_ALIASES: Record<string, string> = {
  start: "starter",
  base: "plus",
  special: "max",
};

export const TELEGRAM_PACKAGE_LIST: TelegramPackage[] = PACKAGE_LIST.map((p) => ({
  id: p.id,
  name: p.nameFa ?? p.name,
  priceToman: p.priceToman,
  credits: p.credits,
}));

export const TELEGRAM_PACKAGES: Record<string, TelegramPackage> = Object.fromEntries(
  TELEGRAM_PACKAGE_LIST.map((p) => [p.id, p])
);

export function resolveTelegramPackageId(id: string): string {
  return LEGACY_PACKAGE_ALIASES[id] ?? id;
}

export function getTelegramPackage(id: string): TelegramPackage | null {
  const resolved = resolveTelegramPackageId(id);
  return TELEGRAM_PACKAGES[resolved] || null;
}

export function formatToman(n: number): string {
  return formatPriceToman(n);
}
