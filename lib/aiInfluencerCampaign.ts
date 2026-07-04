// =========================================================
// AI Influencer Campaign — محتوا، لینک‌ها و playbook اجرایی
// محصول: Arena Starter (۷۹k) با ۲۰٪ تخفیف = ۶۳,۲۰۰ تومان
// =========================================================

import { AI_PACKAGES } from "@/lib/aiPackages";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com";
const CAMPAIGN = "micro_ig_jul26";
const MEDIUM_IG = "instagram";
const MEDIUM_TG = "telegram";

export const STARTER_LIST_PRICE_TOMAN = AI_PACKAGES.starter.priceToman;
export const STARTER_DISCOUNT_PERCENT = 20;
export const STARTER_FINAL_PRICE_TOMAN = Math.round(
  STARTER_LIST_PRICE_TOMAN * (1 - STARTER_DISCOUNT_PERCENT / 100)
);

export type InfluencerSlot = {
  id: string;
  label: string;
  code: string;
  utmSource: string;
  budgetToman: number;
  audience: string;
};

/** ۵ اسلات آماده — ۳ تست + ۲ رزرو */
export const INFLUENCER_SLOTS: InfluencerSlot[] = [
  { id: "pageA", label: "پیج A", code: "PAGEA20", utmSource: "pageA", budgetToman: 700_000, audience: "tech / فریلنسر" },
  { id: "pageB", label: "پیج B", code: "PAGEB20", utmSource: "pageB", budgetToman: 700_000, audience: "کسب‌وکار کوچک" },
  { id: "pageC", label: "پیج C", code: "PAGEC20", utmSource: "pageC", budgetToman: 700_000, audience: "محتوا / مارکتینگ" },
  { id: "pageD", label: "پیج D (رزرو)", code: "PAGED20", utmSource: "pageD", budgetToman: 0, audience: "اسکیل" },
  { id: "pageE", label: "پیج E (رزرو)", code: "PAGEE20", utmSource: "pageE", budgetToman: 0, audience: "اسکیل" },
];

export function buildInfluencerLinks(slot: InfluencerSlot, medium = MEDIUM_IG) {
  const utm = new URLSearchParams({
    utm_source: slot.utmSource,
    utm_medium: medium,
    utm_campaign: CAMPAIGN,
  });
  const battleUrl = `${SITE}/ai?${utm.toString()}`;
  const pricingUrl = `${SITE}/ai/pricing?code=${slot.code}&${utm.toString()}`;
  const shortBattleUrl = `${SITE}/ai?src=${slot.utmSource}&utm_medium=${medium}&utm_campaign=${CAMPAIGN}`;
  return { battleUrl, pricingUrl, shortBattleUrl };
}

/** استوری ۴ روزه — {code} و {utmSource} را جایگزین کن */
export const STORY_SEQUENCE = [
  {
    day: 1,
    text: "ChatGPT فقط یک مدله — اگه ۵ تا AI رو با هم مقایسه کنی چی می‌شه؟",
    visual: "اسکرین نبرد دو مدل (بدون لوگوی رقیب)",
    cta: "فردا دمو واقعی",
  },
  {
    day: 2,
    text: "همین سؤال رو به GPT و Claude دادم — جواب‌ها فرق داشت 👇",
    visual: "ضبط ۱۵ ثانیه نبرد واقعی در araaye.com/ai",
    cta: "ذخیره کن",
  },
  {
    day: 3,
    text: "۲ نبرد رایگان — بدون VPN · پرداخت تومان",
    visual: "لینک bio",
    cta: "لینک در bio",
    linkType: "battle" as const,
  },
  {
    day: 4,
    text: "کد {code} = ۲۰٪ تخفیف پکیج استارتر — فقط ۴۸ ساعت · {finalPrice} تومان",
    visual: "اسکرین pricing با کد",
    cta: "لینک خرید",
    linkType: "pricing" as const,
  },
];

/** ۵ ریلز تبلیغاتی */
export const REELS_SCRIPTS = [
  { hook: "۵ مدل، یک سؤال — کی بهتر جواب داد؟", duration: "۳۰s", shot: "نبرد + رأی" },
  { hook: "اسکرین‌رکورد نبرد واقعی GPT vs Claude", duration: "۳۰s", shot: "فقط صفحه محصول" },
  { hook: "بدون VPN — پرداخت تومان", duration: "۱۵s", shot: "لوگو + متن" },
  { hook: "۲ نبرد رایگان — لینک تو bio", duration: "۲۰s", shot: "CTA" },
  { hook: "کد {code} = ۲۰٪ — فقط امروز", duration: "۱۵s", shot: "قیمت قبل/بعد" },
];

export function formatInfluencerBrief(slot: InfluencerSlot): string {
  const links = buildInfluencerLinks(slot);
  return `📦 بریف تبلیغ — ${slot.label}

کد تخفیف: ${slot.code} (${STARTER_DISCOUNT_PERCENT}٪)
قیمت نهایی: ${STARTER_FINAL_PRICE_TOMAN.toLocaleString("fa-IR")} تومان

لینک نبرد رایگان (PLG):
${links.battleUrl}

لینک خرید مستقیم:
${links.pricingUrl}

لینک کوتاه (با ?src=):
${links.shortBattleUrl}

مهلت کد: ۳۰ روز · حداکثر ۵۰ استفاده
پرداخت: زیبال · فعال‌سازی فوری بعد از خرید`;
}

export const INFLUENCER_FAQ = [
  { q: "این چیه؟", a: "آرایه AI — ۵ مدل (GPT, Claude, Gemini, Grok, DeepSeek) در یک جا، با تومان." },
  { q: "رایگان داره؟", a: "۲ نبرد رایگان بدون ثبت‌نام. بعدش پکیج استارتر از ۷۹ هزار تومان." },
  { q: "کد تخفیف روی چیه؟", a: "فقط پکیج استارتر — با کد ۲۰٪ تخفیف می‌شه حدود ۶۳ هزار تومان." },
  { q: "VPN لازمه؟", a: "نه." },
];

// ── Playbook: انتخاب ۳ پیج (هفته ۰) ─────────────────────

export const PAGE_SELECTION_CRITERIA = {
  mustHave: [
    "Audience مرتبط: tech، فریلنسر، کسب‌وکار کوچک، مارکتینگ — نه entertainment عمومی",
    "Engagement rate بالای ۲٪ (لایک+کامنت / فالوور)",
    "استوری فعال — حداقل ۳ استوری در هفته",
    "قبول تبلیغ با لینک خارجی در bio",
  ],
  redFlags: [
    "فالوور فیک / engagement زیر ۰.۵٪",
    "Audience زیر ۱۸ سال غالب",
    "فقط ریلز viral بدون اعتماد",
  ],
  budgetPerPage: { min: 500_000, max: 1_000_000, testPhase: 3 },
  negotiationTemplate: `سلام {name} 👋

می‌خوایم برای آرایه AI (۵ مدل هوش مصنوعی — پرداخت تومان) یک کمپین ۴ روزه استوری + ۱ ریلز اجرا کنی.

پیشنهاد: {budget} تومان
تحویل: ۴ استوری + ۱ ریلز (اسکریپت آماده می‌دیم)
لینک و کد اختصاصی: {code}

اگه موافقی بگو تا بریف کامل بفرستیم.`,
};

// ── Playbook: هفته ۱ ─────────────────────────────────────

export const WEEK1_CHECKLIST = {
  title: "هفته ۱ — لانچ ۳ پیج",
  daily: [
    "چک ai-ops/campaigns: فروش و ثبت‌نام per کد",
    "چک page_views: کلیک per utm_source",
    "ثبت هزینه هر پیج در spreadsheet (برای CAC)",
  ],
  perPage: [
    "روز ۱–۴: استوری‌سری طبق STORY_SEQUENCE",
    "۱ ریلز در روز ۲ یا ۳",
    "A/B: پیج A و C → لینک battle | پیج B → لینک pricing مستقیم",
  ],
  killScaleRules: {
    kill: "۰ فروش بعد از ۷ روز با ۲۰۰+ کلیک",
    scale: "۳+ فروش با CAC زیر ۱۵۰k",
  },
  kpiTargets: {
    clicksPerPage: 200,
    signupsPerPage: 30,
    purchasesPerPage: 2,
    maxCacToman: 300_000,
  },
};

// ── Playbook: هفته ۲ ─────────────────────────────────────

export const WEEK2_CHECKLIST = {
  title: "هفته ۲ — kill/scale + تلگرام",
  tasks: [
    "تصمیم kill/scale برای pageA/B/C بر اساس CAC",
    "۲ کانال تلگرام کاری — همان assetها با utm_medium=telegram",
    "تکمیل ۵ ریلز اگر هنوز آماده نیست (بودجه ۱–۲M)",
    "پیام برنده را document کن برای replicate",
  ],
  telegramSlots: [
    { name: "کانال TG-1", utmSource: "tg_channel_1", code: "PAGEA20" },
    { name: "کانال TG-2", utmSource: "tg_channel_2", code: "PAGEB20" },
  ],
};

// ── Playbook: هفته ۳+ ────────────────────────────────────

export const WEEK3_CHECKLIST = {
  title: "هفته ۳ — اسکیل + ریتارگت",
  tasks: [
    "بودجه ذخیره (۲–۳M) → ۲ پیج برتر (pageD/pageE یا تکرار برنده)",
    "ریتارگت ۱M — فقط بعد از GTM audience روی /ai و /ai/pricing",
    "در GTM: audience از event pageview + begin_checkout",
    "اگر CAC > ۲۰۰k → pause و funnel را battle-first کن",
  ],
  retargeting: {
    budgetToman: 1_000_000,
    audience: "بازدیدکنندگان /ai و /ai/pricing در ۱۴ روز گذشته",
    creative: "همان ریلز برنده + کد تخفیف",
    prerequisite: "GTM purchase + pageview events فعال",
  },
};

export const BUDGET_ALLOCATION = {
  microIgTest: { min: 2_000_000, max: 3_000_000, pages: 3 },
  reelsProduction: { min: 1_000_000, max: 2_000_000 },
  telegramTest: 1_000_000,
  retarget: 1_000_000,
  scaleReserve: { min: 2_000_000, max: 3_000_000 },
  total: { min: 7_000_000, max: 11_000_000 },
};
