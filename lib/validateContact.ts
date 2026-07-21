// پورت سمت‌سرور از منطق فرانت (assets/js/chatbot.js:215-219 و form.js validation).
// نرمال‌سازی ارقام فارسی/عربی به لاتین، سپس تشخیص موبایل ایران یا ایمیل.

/** ارقام فارسی (۰-۹) و عربی (٠-٩) را به لاتین تبدیل می‌کند. */
export function toLatin(s: string): string {
  return String(s)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/** موبایل ایران: 09، +98، 0098 یا 98 و سپس 9 و ۹ رقم. */
export function isPhone(v: string): boolean {
  const digits = toLatin(v).replace(/[\s\-()]/g, "");
  return /^(\+98|0098|98|0)?9\d{9}$/.test(digits);
}

/** آیدی تلگرام: @ و حداقل ۵ کاراکتر (a-z, 0-9, _). */
export function isTelegram(v: string): boolean {
  return /^@[a-zA-Z0-9_]{5,32}$/.test(v.trim());
}

export type ContactKind = "phone" | "email" | "telegram" | "invalid";

/**
 * مقدار تماس را اعتبارسنجی و نرمال می‌کند.
 * شماره به فرمت یکدست 09xxxxxxxxx برمی‌گردد؛ ایمیل lowercase و trim.
 */
export function normalizeContact(rawInput: string): {
  kind: ContactKind;
  value: string;
} {
  const raw = String(rawInput || "").trim();
  if (!raw) return { kind: "invalid", value: "" };

  if (isPhone(raw)) {
    const digits = toLatin(raw).replace(/[\s\-()]/g, "");
    // به فرمت 09xxxxxxxxx یکدست می‌کنیم
    const local = digits.replace(/^(\+98|0098|98|0)?/, "");
    return { kind: "phone", value: "0" + local };
  }

  if (isEmail(raw)) {
    return { kind: "email", value: raw.toLowerCase() };
  }

  if (isTelegram(raw)) {
    return { kind: "telegram", value: raw.toLowerCase() };
  }

  return { kind: "invalid", value: raw };
}

/** Mask a phone number for UI display: 0912xxxxx89 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 4) + "xxxxx" + phone.slice(-2);
}
