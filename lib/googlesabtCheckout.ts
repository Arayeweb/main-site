// داده‌های کمکی چک‌اوت ثبت گوگل — استان/شهر، دسته، ساعات کاری

export const GOOGLESABT_CATEGORIES = [
  "رستوران و کافه",
  "مطب و کلینیک",
  "فروشگاه",
  "آرایشگاه و زیبایی",
  "شرکت و دفتر",
  "املاک",
  "باشگاه و ورزش",
  "خدمات خودرو",
  "آموزشگاه",
  "سایر",
] as const;

export type GooglesabtCategory = (typeof GOOGLESABT_CATEGORIES)[number];

export const GOOGLESABT_WEEKDAYS = [
  { id: "sat", label: "شنبه" },
  { id: "sun", label: "یکشنبه" },
  { id: "mon", label: "دوشنبه" },
  { id: "tue", label: "سه‌شنبه" },
  { id: "wed", label: "چهارشنبه" },
  { id: "thu", label: "پنجشنبه" },
  { id: "fri", label: "جمعه" },
] as const;

export type GooglesabtWeekdayId = (typeof GOOGLESABT_WEEKDAYS)[number]["id"];

/** استان → شهرهای پرتکرار (برای فرم سریع، نه فهرست کامل) */
export const IRAN_PROVINCE_CITIES: Record<string, string[]> = {
  تهران: ["تهران", "شهریار", "اسلامشهر", "پردیس", "ری", "قدس", "ملارد"],
  اصفهان: ["اصفهان", "کاشان", "نجف‌آباد", "خمینی‌شهر", "شاهین‌شهر"],
  فارس: ["شیراز", "مرودشت", "جهرم", "کازرون", "لار"],
  خراسان‌رضوی: ["مشهد", "نیشابور", "سبزوار", "تربت‌حیدریه", "قوچان"],
  آذربایجان‌شرقی: ["تبریز", "مراغه", "مرند", "اهر"],
  آذربایجان‌غربی: ["ارومیه", "خوی", "مهاباد", "بوکان"],
  خوزستان: ["اهواز", "آبادان", "دزفول", "ماهشهر", "خرمشهر"],
  مازندران: ["ساری", "بابل", "آمل", "قائم‌شهر", "چالوس"],
  گیلان: ["رشت", "انزلی", "لاهیجان", "رودسر"],
  کرمان: ["کرمان", "رفسنجان", "سیرجان", "جیرفت"],
  البرز: ["کرج", "فردیس", "نظرآباد", "هشتگرد"],
  قم: ["قم"],
  یزد: ["یزد", "میبد", "اردکان"],
  همدان: ["همدان", "ملایر", "نهاوند"],
  مرکزی: ["اراک", "ساوه", "محلات"],
  قزوین: ["قزوین", "تاکستان", "آبیک"],
  زنجان: ["زنجان", "ابهر"],
  کردستان: ["سنندج", "سقز", "مریوان"],
  کرمانشاه: ["کرمانشاه", "اسلام‌آباد غرب"],
  لرستان: ["خرم‌آباد", "بروجرد", "دورود"],
  هرمزگان: ["بندرعباس", "کیش", "قشم", "میناب"],
  بوشهر: ["بوشهر", "عسلویه", "کنگان"],
  سیستان‌وبلوچستان: ["زاهدان", "چابهار", "ایرانشهر"],
  گلستان: ["گرگان", "گنبدکاووس", "علی‌آباد"],
  اردبیل: ["اردبیل", "مشگین‌شهر", "خلخال"],
  سمنان: ["سمنان", "شاهرود", "دامغان"],
  چهارمحال‌وبختیاری: ["شهرکرد", "بروجن"],
  کهگیلویه‌وبویراحمد: ["یاسوج", "دوگنبدان"],
  ایلام: ["ایلام", "دهلران"],
  خراسان‌شمالی: ["بجنورد", "شیروان"],
  خراسان‌جنوبی: ["بیرجند", "قائن"],
};

export const IRAN_PROVINCES = Object.keys(IRAN_PROVINCE_CITIES);

/** مرکز تقریبی استان‌ها برای پیش‌فرض نقشه */
export const PROVINCE_MAP_CENTER: Record<string, { lat: number; lng: number }> = {
  تهران: { lat: 35.6892, lng: 51.389 },
  اصفهان: { lat: 32.6539, lng: 51.666 },
  فارس: { lat: 29.5918, lng: 52.5836 },
  خراسان‌رضوی: { lat: 36.2605, lng: 59.6168 },
  آذربایجان‌شرقی: { lat: 38.0962, lng: 46.2738 },
  آذربایجان‌غربی: { lat: 37.5527, lng: 45.0761 },
  خوزستان: { lat: 31.3183, lng: 48.6706 },
  مازندران: { lat: 36.5659, lng: 53.0586 },
  گیلان: { lat: 37.2808, lng: 49.5832 },
  کرمان: { lat: 30.2839, lng: 57.0834 },
  البرز: { lat: 35.84, lng: 50.9391 },
  قم: { lat: 34.6416, lng: 50.8746 },
  یزد: { lat: 31.8974, lng: 54.3569 },
  همدان: { lat: 34.7983, lng: 48.5148 },
  مرکزی: { lat: 34.0954, lng: 49.7013 },
  قزوین: { lat: 36.2797, lng: 50.0049 },
  زنجان: { lat: 36.6769, lng: 48.4963 },
  کردستان: { lat: 35.3219, lng: 46.9862 },
  کرمانشاه: { lat: 34.3142, lng: 47.065 },
  لرستان: { lat: 33.4878, lng: 48.3558 },
  هرمزگان: { lat: 27.1832, lng: 56.2666 },
  بوشهر: { lat: 28.9234, lng: 50.8203 },
  سیستان‌وبلوچستان: { lat: 29.4963, lng: 60.8629 },
  گلستان: { lat: 36.8456, lng: 54.4393 },
  اردبیل: { lat: 38.2498, lng: 48.2933 },
  سمنان: { lat: 35.5769, lng: 53.3953 },
  چهارمحال‌وبختیاری: { lat: 32.3256, lng: 50.8644 },
  کهگیلویه‌وبویراحمد: { lat: 30.6684, lng: 51.5875 },
  ایلام: { lat: 33.6374, lng: 46.4226 },
  خراسان‌شمالی: { lat: 37.475, lng: 57.3333 },
  خراسان‌جنوبی: { lat: 32.8649, lng: 59.2262 },
};

export const DEFAULT_MAP_CENTER = { lat: 35.6892, lng: 51.389 };

export type CheckoutWizardStep = 1 | 2 | 3 | 4 | 5;

export const CHECKOUT_STEP_LABELS: Record<CheckoutWizardStep, string> = {
  1: "اطلاعات کسب‌وکار",
  2: "آدرس",
  3: "ساعات کاری",
  4: "بازبینی",
  5: "ثبت درخواست",
};

/** بازه ترجیحی تماس کارشناس با مشتری */
export const GOOGLESABT_CALL_WINDOWS = [
  { id: "morning", label: "صبح", hint: "۹ تا ۱۲" },
  { id: "afternoon", label: "ظهر", hint: "۱۲ تا ۱۶" },
  { id: "evening", label: "عصر", hint: "۱۶ تا ۲۰" },
  { id: "anytime", label: "هر ساعتی", hint: "روز کاری" },
] as const;

export type GooglesabtCallWindowId = (typeof GOOGLESABT_CALL_WINDOWS)[number]["id"];

export const GOOGLESABT_CONTACT_CHANNELS = [
  { id: "call", label: "تماس تلفنی" },
  { id: "whatsapp", label: "واتساپ" },
] as const;

export type GooglesabtContactChannelId = (typeof GOOGLESABT_CONTACT_CHANNELS)[number]["id"];

export function callWindowLabel(id: GooglesabtCallWindowId): string {
  const row = GOOGLESABT_CALL_WINDOWS.find((w) => w.id === id);
  return row ? `${row.label} (${row.hint})` : id;
}

export interface GooglesabtOrderDraft {
  packageKey: "basic" | "popular" | "vip";
  businessName: string;
  /** نام فرد پاسخگو برای تماس کارشناس */
  contactName: string;
  phone: string;
  category: string;
  province: string;
  city: string;
  address: string;
  lat: number | null;
  lng: number | null;
  openTime: string;
  closeTime: string;
  weekdays: GooglesabtWeekdayId[];
  preferredCallWindow: GooglesabtCallWindowId;
  contactChannel: GooglesabtContactChannelId;
  /** کد تخفیف نرمال‌شده (اختیاری) */
  discountCode: string;
}

export const emptyOrderDraft = (
  packageKey: GooglesabtOrderDraft["packageKey"] = "popular"
): GooglesabtOrderDraft => ({
  packageKey,
  businessName: "",
  contactName: "",
  phone: "",
  category: "",
  province: "",
  city: "",
  address: "",
  lat: null,
  lng: null,
  openTime: "09:00",
  closeTime: "21:00",
  weekdays: ["sat", "sun", "mon", "tue", "wed", "thu"],
  preferredCallWindow: "anytime",
  contactChannel: "call",
  discountCode: "",
});

export const CHECKOUT_STORAGE_KEY = "googlesabt_checkout_v2";

