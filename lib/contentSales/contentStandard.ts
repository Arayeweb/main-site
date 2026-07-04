/** استاندارد یکدست محتوای Content & Sales Bundle */

export const HOOK_MAX_WORDS = 12;
export const CAPTION_MAX_WORDS = 150;
export const DM_MAX_LINES = 6;

export const FORBIDDEN_IN_TEMPLATES = [
  "/ai/content-sales",
  "content-sales",
  "۵۹۰",
  "Araaye AI Content",
] as const;

export const AI_PROMPT_SECTIONS = [
  "نقش",
  "زمینه",
  "وظیفه",
  "خروجی",
  "محدودیت",
] as const;

/** ساخت پرامپت ۵ بخشی برای قالب‌های AI */
export function buildAiPrompt(parts: {
  role: string;
  context: string;
  task: string;
  output: string;
  constraints: string;
}): string {
  return [
    `نقش: ${parts.role}`,
    `زمینه: ${parts.context}`,
    `وظیفه: ${parts.task}`,
    `خروجی: ${parts.output}`,
    `محدودیت: ${parts.constraints}`,
  ].join("\n");
}

export const CRITIQUE_STEPS = [
  "۱) خروجی خام AI را بگیر",
  "۲) با سیستم نقد، ۳ ضعف مشخص کن",
  "۳) ورودی‌های گم‌شده را اضافه کن",
  "۴) نسخه نهایی را کپی و منتشر کن",
] as const;
