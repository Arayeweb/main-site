// Persian labels + types for the Araaye AI ops admin panel (app/admin/ai-ops)
// No mock data — every page backed by real Supabase queries.

export const AI_PLAN_LABELS: Record<string, string> = {
  free: "رایگان",
  starter: "شروع",
  plus: "پلاس",
  pro: "حرفه‌ای",
  max: "مکس",
  team_mini: "تیم کوچک",
  business: "سازمانی",
};

export const AI_USER_STATUS_LABELS: Record<string, string> = {
  active: "فعال",
  suspended: "معلق",
  banned: "مسدود",
};

export const AI_USER_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-50 text-green-700 ring-green-200",
  suspended: "bg-amber-50 text-amber-700 ring-amber-200",
  banned: "bg-red-50 text-red-700 ring-red-200",
};

export const AI_MODEL_TIER_LABELS: Record<string, string> = {
  economy: "اقتصادی",
  mid: "متوسط",
  premium: "پرچمدار",
};

export const AI_MODEL_TIER_COLORS: Record<string, string> = {
  economy: "bg-slate-50 text-slate-600 ring-slate-200",
  mid: "bg-blue-50 text-blue-700 ring-blue-200",
  premium: "bg-violet-50 text-violet-700 ring-violet-200",
};

export const AI_PROVIDER_STATUS_LABELS: Record<string, string> = {
  operational: "سالم",
  degraded: "کاهش کیفیت",
  down: "قطع",
};

export const AI_PROVIDER_STATUS_COLORS: Record<string, string> = {
  operational: "bg-green-50 text-green-700 ring-green-200",
  degraded: "bg-amber-50 text-amber-700 ring-amber-200",
  down: "bg-red-50 text-red-700 ring-red-200",
};

export const AI_ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار",
  paid: "پرداخت‌شده",
  failed: "ناموفق",
};

export const AI_ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  paid: "bg-green-50 text-green-700 ring-green-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
};

export const AI_TICKET_STATUS_LABELS: Record<string, string> = {
  open: "باز",
  answered: "پاسخ داده‌شده",
  closed: "بسته‌شده",
};

export const AI_TICKET_STATUS_COLORS: Record<string, string> = {
  open: "bg-red-50 text-red-700 ring-red-200",
  answered: "bg-green-50 text-green-700 ring-green-200",
  closed: "bg-slate-50 text-slate-600 ring-slate-200",
};

export const AI_TICKET_PRIORITY_LABELS: Record<string, string> = {
  low: "پایین",
  normal: "متوسط",
  high: "بالا",
};

export const AI_TICKET_PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-50 text-slate-600 ring-slate-200",
  normal: "bg-amber-50 text-amber-700 ring-amber-200",
  high: "bg-red-50 text-red-700 ring-red-200",
};

export const AI_NOTIF_STATUS_LABELS: Record<string, string> = {
  draft: "پیش‌نویس",
  scheduled: "زمان‌بندی‌شده",
  sent: "ارسال‌شده",
};

export const AI_NOTIF_STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-50 text-slate-600 ring-slate-200",
  scheduled: "bg-blue-50 text-blue-700 ring-blue-200",
  sent: "bg-green-50 text-green-700 ring-green-200",
};

export const AI_PROMO_KIND_LABELS: Record<string, string> = {
  percent: "درصدی",
  fixed: "مبلغ ثابت",
};

export function formatToman(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(Math.round(n)) + " تومان";
}

export function formatUsd(n: number): string {
  return "$" + n.toFixed(4);
}

export function formatNum(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(Math.round(n));
}

export function formatFaDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fa-IR");
  } catch {
    return "—";
  }
}

export function formatFaDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

/** نرخ تبدیل تقریبی — فقط برای نمایش هزینه USD در کنار درآمد تومانی در داشبورد */
export const USD_TO_TOMAN_APPROX = Number(process.env.NEXT_PUBLIC_USD_TOMAN_RATE || "850000");
