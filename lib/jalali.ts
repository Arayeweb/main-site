/** تبدیل و فرمت تاریخ شمسی (جلالی) بدون وابستگی خارجی */

export type JalaliParts = { jy: number; jm: number; jd: number };
export type GregorianParts = { gy: number; gm: number; gd: number };

const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

function div(a: number, b: number) {
  return Math.floor(a / b);
}

/** الگوریتم استاندارد jalaali */
export function toJalali(gy: number, gm: number, gd: number): JalaliParts {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  let gy2 = gy <= 1600 ? gy - 621 : gy - 1600;
  const days =
    365 * gy2 +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) -
    80 +
    gd +
    g_d_m[gm - 1] -
    (gm > 2 && ((gy2 % 4 === 0 && gy2 % 100 !== 0) || gy2 % 400 === 0) ? 1 : 0);
  jy += 33 * div(days, 12053);
  let remaining = days % 12053;
  jy += 4 * div(remaining, 1461);
  remaining %= 1461;
  if (remaining > 365) {
    jy += div(remaining - 1, 365);
    remaining = (remaining - 1) % 365;
  }
  const jm = remaining < 186 ? 1 + div(remaining, 31) : 7 + div(remaining - 186, 30);
  const jd = 1 + (remaining < 186 ? remaining % 31 : (remaining - 186) % 30);
  return { jy, jm, jd };
}

export function toGregorian(jy: number, jm: number, jd: number): GregorianParts {
  let gy = jy <= 979 ? 621 : 1600;
  let jy2 = jy <= 979 ? jy : jy - 979;
  let days =
    365 * jy2 +
    div(jy2, 33) * 8 +
    div((jy2 % 33) + 3, 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * div(days, 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * div(--days, 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    gy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  for (gm = 1; gm <= 12 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
  return { gy, gm, gd };
}

export function isJalaliLeap(jy: number): boolean {
  const r = (((jy - (jy > 0 ? 474 : 473)) % 2820) + 474 + 38) * 682;
  return r % 2816 < 682;
}

export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeap(jy) ? 30 : 29;
}

export function jalaliMonthName(jm: number): string {
  return JALALI_MONTHS[jm - 1] ?? String(jm);
}

export const JALALI_MONTH_OPTIONS = JALALI_MONTHS.map((label, i) => ({
  value: i + 1,
  label,
}));

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** ISO / Date → اجزای شمسی */
export function dateToJalali(input: string | Date | null | undefined): JalaliParts | null {
  if (!input) return null;
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return null;
  return toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/** YYYY-MM-DD میلادی از اجزای شمسی */
export function jalaliToIsoDate(jy: number, jm: number, jd: number): string {
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return `${gy}-${pad2(gm)}-${pad2(gd)}`;
}

/** مقدار input type=date (YYYY-MM-DD) → اجزای شمسی */
export function isoDateToJalali(isoDate: string | null | undefined): JalaliParts | null {
  if (!isoDate) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (!m) return dateToJalali(isoDate);
  return toJalali(Number(m[1]), Number(m[2]), Number(m[3]));
}

export function formatJalaliDate(iso: string | null | undefined): string {
  const parts = dateToJalali(iso);
  if (!parts) return '—';
  return `${parts.jy}/${pad2(parts.jm)}/${pad2(parts.jd)}`;
}

export function formatJalaliDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const parts = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return `${parts.jy}/${pad2(parts.jm)}/${pad2(parts.jd)}، ${time}`;
}

/** سال‌های رایج برای انتخابگر (حدود ۵ سال قبل تا ۲ سال بعد) */
export function defaultJalaliYearOptions(aroundJy?: number): number[] {
  const now = toJalali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
  const center = aroundJy ?? now.jy;
  const years: number[] = [];
  for (let y = center + 2; y >= center - 8; y--) years.push(y);
  return years;
}
