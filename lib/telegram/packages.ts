// =========================================================
// Telegram credit packages — launch pricing (separate from web)
// =========================================================

export interface TelegramPackage {
  id: string;
  name: string;
  priceToman: number;
  credits: number;
}

export const TELEGRAM_PACKAGES: Record<string, TelegramPackage> = {
  start: {
    id: "start",
    name: "شروع",
    priceToman: 99_000,
    credits: 100,
  },
  base: {
    id: "base",
    name: "پایه",
    priceToman: 299_000,
    credits: 400,
  },
  pro: {
    id: "pro",
    name: "حرفه‌ای",
    priceToman: 699_000,
    credits: 1000,
  },
  special: {
    id: "special",
    name: "ویژه",
    priceToman: 1_490_000,
    credits: 2500,
  },
};

export const TELEGRAM_PACKAGE_LIST = Object.values(TELEGRAM_PACKAGES);

export function getTelegramPackage(id: string): TelegramPackage | null {
  return TELEGRAM_PACKAGES[id] || null;
}

export function formatToman(n: number): string {
  return n.toLocaleString("fa-IR");
}
