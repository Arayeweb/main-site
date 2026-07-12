export type PromptCategoryId =
  | "programming"
  | "career"
  | "marketing"
  | "business"
  | "writing"
  | "image";

export type AraayePrompt = {
  slug: string;
  title: string;
  category: PromptCategoryId;
  shortDescription: string;
  /** ۲–۳ پاراگراف برای بخش «این پرامپت چه کاری انجام می‌دهد؟» */
  whatItDoes?: string[];
  searchIntent: string;
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
  metaTitle: string;
  metaDescription: string;
  canonicalPath: string;
};

export type PromptCategoryMeta = {
  id: PromptCategoryId;
  label: string;
  description: string;
};

export const PROMPT_CATEGORIES: PromptCategoryMeta[] = [
  {
    id: "programming",
    label: "برنامه‌نویسی",
    description: "دیباگ، ریویو کد، SQL، Regex و توابع",
  },
  {
    id: "career",
    label: "شغلی و رزومه",
    description: "رزومه، کاور لتر، لینکدین و مصاحبه",
  },
  {
    id: "marketing",
    label: "مارکتینگ",
    description: "کپشن، تبلیغ، سئو و توضیح محصول",
  },
  {
    id: "business",
    label: "کسب‌وکار",
    description: "قرارداد، بیزینس پلن، فروش و پروپوزال",
  },
  {
    id: "writing",
    label: "نوشتن و محتوا",
    description: "ایمیل، ترجمه، خلاصه و بازنویسی",
  },
  {
    id: "image",
    label: "تولید تصویر",
    description: "لوگو، عکس محصول، پوستر و آواتار",
  },
];

export function getCategoryLabel(id: PromptCategoryId): string {
  return PROMPT_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
