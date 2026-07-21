import type { AraayePrompt } from "./promptTypes";

/** Normalize prompt records with default canonical path. */
export function definePrompt(
  partial: Omit<AraayePrompt, "canonicalPath"> & { canonicalPath?: string }
): AraayePrompt {
  return {
    ...partial,
    canonicalPath: partial.canonicalPath ?? `/prompts/${partial.slug}`,
  };
}

export function standardFaq(topic: string): AraayePrompt["faq"] {
  return [
    {
      question: `این پرامپت برای چه کسانی مناسب است؟`,
      answer: `برای هر کسی که می‌خواهد سریع‌تر و دقیق‌تر برای «${topic}» از ChatGPT، Claude، Gemini یا Araaye AI نتیجه بگیرد.`,
    },
    {
      question: "چطور بهترین نتیجه را بگیرم؟",
      answer:
        "جایگاه‌های {{…}} را با جزئیات واقعی پر کن، مخاطب و هدف را مشخص کن، و اگر خروجی ناقص بود یک دور اصلاح بخواه.",
    },
    {
      question: "آیا نسخه GPT / Claude / Gemini فرق دارد؟",
      answer:
        "نسخه اصلی برای اکثر مدل‌ها کافی است؛ نسخه‌های اختصاصی لحن و ساختار را با سبک همان مدل هم‌راستا می‌کنند.",
    },
    {
      question: "می‌توانم مستقیم در Araaye AI اجرا کنم؟",
      answer: "بله؛ دکمه «اجرا در Araaye AI» همان پرامپت را در چت باز می‌کند تا بدون کپی‌دستی شروع کنی.",
    },
    {
      question: "آیا محتوا رایگان است؟",
      answer: "بله؛ دیدن و کپی پرامپت رایگان است. مصرف اعتبار فقط هنگام اجرای مدل در Araaye AI اعمال می‌شود.",
    },
  ];
}
