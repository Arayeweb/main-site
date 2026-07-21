export type PromptCategoryId =
  | "writing"
  | "programming"
  | "marketing"
  | "business"
  | "social"
  | "design"
  | "learning"
  | "language"
  | "data"
  | "productivity";

export type AraayePrompt = {
  slug: string;
  title: string;
  category: PromptCategoryId;
  shortDescription: string;
  /** ۲–۳ پاراگراف برای بخش «این پرامپت چه کاری انجام می‌دهد؟» */
  whatItDoes?: string[];
  searchIntent: string;
  /** عبارت intent فارسی مثل «پرامپت برای دیباگ پایتون» */
  intentPhrase?: string;
  /** برچسب‌های کمکی برای فیلتر/SEO مثل image, career, react */
  tags?: string[];
  targetUser: string;
  basePrompt: string;
  gptVersion?: string;
  claudeVersion?: string;
  geminiVersion?: string;
  exampleInput?: string;
  exampleOutput: string;
  useCases: string[];
  commonMistakes: string[];
  relatedPrompts: string[];
  faq: {
    question: string;
    answer: string;
  }[];
  /** Optional ready-to-copy alternates (e.g. logo style variants). */
  promptVariations?: { label: string; text: string }[];
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
};

export type PromptCategoryMeta = {
  id: PromptCategoryId;
  label: string;
  description: string;
  /** Intro copy for /prompts/category/[id] */
  intro: string;
  metaTitle: string;
  metaDescription: string;
};

export const PROMPT_CATEGORIES: PromptCategoryMeta[] = [
  {
    id: "writing",
    label: "نویسندگی و محتوا",
    description: "مقاله، ایمیل، رزومه، خلاصه و بازنویسی",
    intro:
      "پرامپت‌های آماده برای نوشتن مقاله سئو، ایمیل رسمی، رزومه، کاورلتر، خلاصه‌سازی و بازنویسی متن فارسی.",
    metaTitle: "پرامپت نویسندگی و محتوا | کتابخانه Araaye AI",
    metaDescription:
      "بهترین پرامپت برای نوشتن مقاله، ایمیل، رزومه و بازنویسی متن. آماده کپی یا اجرا در Araaye AI، ChatGPT، Claude و Gemini.",
  },
  {
    id: "programming",
    label: "برنامه‌نویسی",
    description: "دیباگ، ریویو کد، SQL، API و تست",
    intro:
      "پرامپت‌های برنامه‌نویسی برای دیباگ، Code Review، ساخت API، کامپوننت React، اسکریپت Python و تولید تست.",
    metaTitle: "پرامپت برنامه‌نویسی | کتابخانه Araaye AI",
    metaDescription:
      "پرامپت برای برنامه‌نویسی، دیباگ پایتون، React، SQL و Code Review. کپی کن یا مستقیم در Araaye AI اجرا کن.",
  },
  {
    id: "marketing",
    label: "مارکتینگ و SEO",
    description: "کلمه کلیدی، متا، لندینگ و تبلیغ",
    intro:
      "پرامپت‌های مارکتینگ و سئو برای تحقیق کلمات کلیدی، Meta Title، تحلیل رقبا، کپی لندینگ و CTA.",
    metaTitle: "پرامپت مارکتینگ و سئو | کتابخانه Araaye AI",
    metaDescription:
      "پرامپت برای تحلیل سئو، تحقیق کلمات کلیدی، Meta Description، تبلیغ گوگل و کپی لندینگ — رایگان برای Araaye AI.",
  },
  {
    id: "business",
    label: "کسب‌وکار",
    description: "بیزینس پلن، SWOT، OKR و فروش",
    intro:
      "پرامپت‌های کسب‌وکار برای بیزینس پلن، SWOT، OKR، قیمت‌گذاری، پرسونای مشتری و پیچ دک.",
    metaTitle: "پرامپت کسب‌وکار | کتابخانه Araaye AI",
    metaDescription:
      "پرامپت برای بیزینس پلن، SWOT، OKR، قیمت‌گذاری و Pitch Deck. آماده استفاده در ChatGPT و Araaye AI.",
  },
  {
    id: "social",
    label: "شبکه‌های اجتماعی",
    description: "کپشن، ریلز، لینکدین و تقویم محتوا",
    intro:
      "پرامپت‌های شبکه‌های اجتماعی برای کپشن اینستاگرام، پست لینکدین، سناریوی ریلز، یوتیوب و تقویم محتوا.",
    metaTitle: "پرامپت شبکه‌های اجتماعی | کتابخانه Araaye AI",
    metaDescription:
      "پرامپت برای تولید پست اینستاگرام، لینکدین، ریلز، یوتیوب و هشتگ — کپی یا اجرا در Araaye AI.",
  },
  {
    id: "design",
    label: "طراحی و UI/UX",
    description: "UI Audit، پالت رنگ، لوگو و تصویر",
    intro:
      "پرامپت‌های طراحی برای UI Audit، UX Review، پالت رنگ، Design System و تولید تصویر با AI.",
    metaTitle: "پرامپت طراحی و UI/UX | کتابخانه Araaye AI",
    metaDescription:
      "پرامپت برای UI Audit، طراحی لوگو، پالت رنگ و Design System. مناسب ChatGPT، Claude و Araaye AI.",
  },
  {
    id: "learning",
    label: "یادگیری و دانشگاه",
    description: "خلاصه کتاب، برنامه مطالعه و فلش‌کارت",
    intro:
      "پرامپت‌های یادگیری برای خلاصه کتاب، برنامه مطالعه، فلش‌کارت و توضیح ساده مفاهیم درسی.",
    metaTitle: "پرامپت یادگیری و دانشگاه | کتابخانه Araaye AI",
    metaDescription:
      "پرامپت برای خلاصه کتاب، برنامه مطالعه، فلش‌کارت و توضیح ساده — مناسب دانشجو و خودآموز.",
  },
  {
    id: "language",
    label: "ترجمه و زبان",
    description: "ترجمه، گرامر، لحن و بومی‌سازی",
    intro:
      "پرامپت‌های ترجمه و زبان برای ترجمه فارسی/انگلیسی، بهبود گرامر، تغییر لحن و بومی‌سازی محتوا.",
    metaTitle: "پرامپت ترجمه و زبان | کتابخانه Araaye AI",
    metaDescription:
      "پرامپت برای ترجمه فارسی، ترجمه انگلیسی، بهبود گرامر و بومی‌سازی متن — رایگان در Araaye AI.",
  },
  {
    id: "data",
    label: "تحلیل داده و فایل",
    description: "Excel، CSV، PDF و گزارش",
    intro:
      "پرامپت‌های تحلیل داده برای Excel، CSV، استخراج داده از فایل و نوشتن گزارش تحلیلی.",
    metaTitle: "پرامپت تحلیل داده و فایل | کتابخانه Araaye AI",
    metaDescription:
      "پرامپت برای تحلیل Excel، CSV، استخراج داده و گزارش‌نویسی — آماده کپی و اجرا در Araaye AI.",
  },
  {
    id: "productivity",
    label: "بهره‌وری شخصی",
    description: "برنامه روزانه، تصمیم‌گیری و ایده‌پردازی",
    intro:
      "پرامپت‌های بهره‌وری برای برنامه روزانه و هفتگی، لیست کارها، تصمیم‌گیری و ایده‌پردازی.",
    metaTitle: "پرامپت بهره‌وری شخصی | کتابخانه Araaye AI",
    metaDescription:
      "پرامپت برای برنامه روزانه، برنامه هفتگی، تصمیم‌گیری و Brainstorm — سریع و آماده در Araaye AI.",
  },
];

export function getCategoryMeta(id: PromptCategoryId): PromptCategoryMeta | undefined {
  return PROMPT_CATEGORIES.find((c) => c.id === id);
}

export function getCategoryLabel(id: PromptCategoryId): string {
  return getCategoryMeta(id)?.label ?? id;
}

export function isPromptCategoryId(value: string): value is PromptCategoryId {
  return PROMPT_CATEGORIES.some((c) => c.id === value);
}
