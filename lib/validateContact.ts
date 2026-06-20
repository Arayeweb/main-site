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

/** موبایل ایران: با/بدون پیش‌شماره +98 / 0098 / 0 و سپس 9 و ۹ رقم. */
export function isPhone(v: string): boolean {
  return /^(\+98|0098|0)?9\d{9}$/.test(toLatin(v).replace(/[\s\-()]/g, ""));
}

export type ContactKind = "phone" | "email" | "invalid";

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
    const local = digits.replace(/^(\+98|0098|0)?/, "");
    return { kind: "phone", value: "0" + local };
  }

  if (isEmail(raw)) {
    return { kind: "email", value: raw.toLowerCase() };
  }

  return { kind: "invalid", value: raw };
}
