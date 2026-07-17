import { COMPARE_MODELS, getModel } from "@/lib/aiModels";

export type CompareDimension = {
  label: string;
  /** Scores 1–5 for model A and B (static editorial, not live benchmarks) */
  scores: [number, number];
};

export type ComparePageDef = {
  slug: string;
  kind: "pair" | "usecase";
  title: string;
  h1: string;
  description: string;
  modelAId: string;
  modelBId: string;
  modelALabel: string;
  modelBLabel: string;
  samplePrompt: string;
  sampleAnswers: { label: string; text: string }[];
  dimensions: CompareDimension[];
  bestFor: { model: "A" | "B"; useCase: string }[];
  faq: { q: string; a: string }[];
  lastUpdated: string;
  relatedSlugs: string[];
  cardBlurb: string;
};

const LAST_UPDATED = "2026-07-17";

function dims(
  a: [number, number, number, number, number, number],
  b: [number, number, number, number, number, number]
): CompareDimension[] {
  const labels = ["سرعت", "دقت", "فارسی", "کدنویسی", "تولید محتوا", "قیمت"] as const;
  return labels.map((label, i) => ({ label, scores: [a[i], b[i]] as [number, number] }));
}

export const COMPARE_PAGES: ComparePageDef[] = [
  {
    slug: "chatgpt-vs-gemini",
    kind: "pair",
    title: "مقایسه ChatGPT و Gemini | کدام بهتر است؟",
    h1: "مقایسه ChatGPT و Gemini؛ کدام برای شما بهتر است؟",
    description:
      "مقایسه زنده ChatGPT (GPT-4o) و Gemini در سرعت، فارسی، کدنویسی و تولید محتوا — در هوش مصنوعی آرایه هر دو را امتحان کنید.",
    modelAId: "cmp-gpt-55",
    modelBId: "cmp-gemini-pro",
    modelALabel: "ChatGPT (GPT-4o)",
    modelBLabel: "Gemini 2.5 Pro",
    samplePrompt: "این متن معرفی محصول را کوتاه‌تر و متقاعدکننده‌تر کن.",
    sampleAnswers: [
      {
        label: "ChatGPT",
        text: "محصولی که وقت شما را ذخیره می‌کند — همین امروز امتحان کنید.",
      },
      {
        label: "Gemini",
        text: "یک جمله مزیت + یک دلیل اعتماد + یک دعوت به اقدام کوتاه.",
      },
    ],
    dimensions: dims([4, 5, 4, 5, 5, 3], [5, 4, 4, 4, 4, 3]),
    bestFor: [
      { model: "A", useCase: "نوشتن، بازنویسی و گفتگوی عمومی" },
      { model: "B", useCase: "تحلیل چندرسانه‌ای و استدلال سریع" },
    ],
    faq: [
      {
        q: "ChatGPT بهتر است یا Gemini؟",
        a: "بستگی به کار دارد. ChatGPT معمولاً در نوشتار و کدنویسی قوی‌تر حس می‌شود؛ Gemini در سرعت و چندرسانه‌ای. در آرایه هر دو را با یک پرامپت مقایسه کنید.",
      },
      {
        q: "آیا می‌توانم همین‌جا هر دو را تست کنم؟",
        a: "بله. ویجت مقایسه زنده زیر همین صفحه، یا حالت مقایسه در هوش مصنوعی آرایه.",
      },
    ],
    lastUpdated: LAST_UPDATED,
    relatedSlugs: ["chatgpt-vs-claude", "claude-vs-gemini", "best-ai-for-content"],
    cardBlurb: "دو غول محبوب را کنار هم ببینید",
  },
  {
    slug: "chatgpt-vs-claude",
    kind: "pair",
    title: "مقایسه ChatGPT و Claude | کدام بهتر است؟",
    h1: "مقایسه ChatGPT و Claude؛ کدام برای نوشتار و تحلیل؟",
    description:
      "مقایسه ChatGPT و Claude در دقت، فارسی، کدنویسی و تولید محتوا — پاسخ‌ها را در آرایه کنار هم ببینید.",
    modelAId: "cmp-gpt-55",
    modelBId: "cmp-claude-opus",
    modelALabel: "ChatGPT (GPT-4o)",
    modelBLabel: "Claude Sonnet 4",
    samplePrompt: "این گزارش جلسه را در سه نکته خلاصه کن و یک اقدام بعدی پیشنهاد بده.",
    sampleAnswers: [
      {
        label: "ChatGPT",
        text: "۳ تصمیم کلیدی، ۲ ریسک و یک اقدام مشخص برای هفته بعد.",
      },
      {
        label: "Claude",
        text: "خلاصه ساختاریافته با تمرکز روی مسئولیت‌ها و اولویت اقدام.",
      },
    ],
    dimensions: dims([4, 5, 4, 5, 5, 3], [3, 5, 5, 4, 5, 3]),
    bestFor: [
      { model: "A", useCase: "کار روزمره، کدنویسی و ابزارهای عمومی" },
      { model: "B", useCase: "تحلیل عمیق، ویرایش و نوشتار دقیق" },
    ],
    faq: [
      {
        q: "Claude بهتر از ChatGPT است؟",
        a: "برای متن‌های طولانی و تحلیل دقیق اغلب Claude ترجیح داده می‌شود؛ برای سرعت و همه‌کاره بودن ChatGPT. بهترین راه: تست زنده در آرایه.",
      },
    ],
    lastUpdated: LAST_UPDATED,
    relatedSlugs: ["chatgpt-vs-gemini", "claude-vs-gemini", "best-ai-for-persian"],
    cardBlurb: "نوشتار و استدلال را مقایسه کنید",
  },
  {
    slug: "claude-vs-gemini",
    kind: "pair",
    title: "مقایسه Claude و Gemini | کدام بهتر است؟",
    h1: "مقایسه Claude و Gemini؛ دقت در برابر سرعت",
    description:
      "مقایسه Claude و Gemini برای فارسی، محتوا و کدنویسی — در هوش مصنوعی آرایه هر دو را هم‌زمان تست کنید.",
    modelAId: "cmp-claude-opus",
    modelBId: "cmp-gemini-pro",
    modelALabel: "Claude Sonnet 4",
    modelBLabel: "Gemini 2.5 Pro",
    samplePrompt: "یک طرح کلی برای مقاله آموزشی درباره سئوی محلی بنویس.",
    sampleAnswers: [
      {
        label: "Claude",
        text: "ساختار بخش‌به‌بخش با لحن آموزشی و نکات عملی برای کسب‌وکارهای محلی.",
      },
      {
        label: "Gemini",
        text: "طرح سریع با تیترها، کلمات کلیدی و CTA در پایان هر بخش.",
      },
    ],
    dimensions: dims([3, 5, 5, 4, 5, 3], [5, 4, 4, 4, 4, 3]),
    bestFor: [
      { model: "A", useCase: "متن دقیق، ویرایش و استدلال" },
      { model: "B", useCase: "پاسخ سریع و کارهای چندوجهی" },
    ],
    faq: [
      {
        q: "برای فارسی Claude بهتر است یا Gemini؟",
        a: "هر دو فارسی خوب می‌نویسند؛ Claude اغلب لحن طبیعی‌تری دارد. در صفحه «بهترین هوش مصنوعی برای فارسی» جزئیات بیشتری هست.",
      },
    ],
    lastUpdated: LAST_UPDATED,
    relatedSlugs: ["chatgpt-vs-claude", "chatgpt-vs-gemini", "best-ai-for-persian"],
    cardBlurb: "دقت Claude در برابر سرعت Gemini",
  },
  {
    slug: "chatgpt-vs-deepseek",
    kind: "pair",
    title: "مقایسه ChatGPT و DeepSeek | کدام به‌صرفه‌تر است؟",
    h1: "مقایسه ChatGPT و DeepSeek؛ قدرت در برابر قیمت",
    description:
      "مقایسه ChatGPT و DeepSeek از نظر کیفیت، کدنویسی و هزینه — در آرایه هر دو را با پرداخت تومان امتحان کنید.",
    modelAId: "cmp-gpt-55",
    modelBId: "cmp-deepseek-v4",
    modelALabel: "ChatGPT (GPT-4o)",
    modelBLabel: "DeepSeek Chat",
    samplePrompt: "این تابع TypeScript را ساده‌تر کن و خطاهای احتمالی را بگو.",
    sampleAnswers: [
      {
        label: "ChatGPT",
        text: "بازنویسی خوانا + توضیح edge caseها و پیشنهاد تست.",
      },
      {
        label: "DeepSeek",
        text: "نسخه کوتاه‌تر کد با تمرکز روی عملکرد و هزینه کمتر توکن.",
      },
    ],
    dimensions: dims([4, 5, 4, 5, 5, 3], [5, 4, 3, 5, 3, 5]),
    bestFor: [
      { model: "A", useCase: "کیفیت بالا در نوشتار و گفتگو" },
      { model: "B", useCase: "کدنویسی اقتصادی و حجم بالا" },
    ],
    faq: [
      {
        q: "DeepSeek جایگزین ChatGPT است؟",
        a: "برای خیلی از کارهای کدنویسی و پرسش‌های ساده بله، با هزینه کمتر. برای نوشتار پیچیده اغلب ChatGPT یا Claude بهترند.",
      },
    ],
    lastUpdated: LAST_UPDATED,
    relatedSlugs: ["best-ai-for-coding", "chatgpt-vs-gemini", "chatgpt-vs-claude"],
    cardBlurb: "کیفیت GPT در برابر هزینه DeepSeek",
  },
  {
    slug: "best-ai-for-coding",
    kind: "usecase",
    title: "بهترین هوش مصنوعی برای کدنویسی | مقایسه مدل‌ها",
    h1: "بهترین هوش مصنوعی برای کدنویسی کدام است؟",
    description:
      "مقایسه مدل‌های AI برای برنامه‌نویسی: ChatGPT، Claude و DeepSeek — در آرایه کنار هم تست کنید.",
    modelAId: "cmp-gpt-55",
    modelBId: "cmp-deepseek-v4",
    modelALabel: "ChatGPT (GPT-4o)",
    modelBLabel: "DeepSeek Chat",
    samplePrompt: "علت TypeError در map این آرایه را پیدا کن و دو راه اصلاح بده.",
    sampleAnswers: [
      {
        label: "ChatGPT",
        text: "تشخیص null/undefined + پیشنهاد optional chaining و گارد نوع.",
      },
      {
        label: "DeepSeek",
        text: "توضیح کوتاه خطا + پچ حداقلی و نسخه جایگزین با filter.",
      },
    ],
    dimensions: dims([4, 5, 4, 5, 4, 3], [5, 4, 3, 5, 3, 5]),
    bestFor: [
      { model: "A", useCase: "توضیح کد، معماری و ریویو" },
      { model: "B", useCase: "تولید سریع کد و کارهای تکراری" },
    ],
    faq: [
      {
        q: "بهترین AI برای کدنویسی فارسی‌زبان‌ها چیست؟",
        a: "بستگی به پشته و بودجه دارد. در آرایه می‌توانید GPT، Claude و DeepSeek را روی یک باگ واقعی مقایسه کنید.",
      },
    ],
    lastUpdated: LAST_UPDATED,
    relatedSlugs: ["chatgpt-vs-deepseek", "chatgpt-vs-claude", "best-ai-for-content"],
    cardBlurb: "کدام مدل برای برنامه‌نویسی؟",
  },
  {
    slug: "best-ai-for-persian",
    kind: "usecase",
    title: "بهترین هوش مصنوعی برای فارسی | مقایسه مدل‌ها",
    h1: "بهترین هوش مصنوعی برای زبان فارسی کدام است؟",
    description:
      "کدام مدل فارسی روان‌تری می‌نویسد؟ مقایسه Claude، ChatGPT و Gemini برای کاربران ایرانی در آرایه.",
    modelAId: "cmp-claude-opus",
    modelBId: "cmp-gpt-55",
    modelALabel: "Claude Sonnet 4",
    modelBLabel: "ChatGPT (GPT-4o)",
    samplePrompt: "این ایمیل رسمی را صمیمی‌تر و روان‌تر به فارسی بازنویسی کن.",
    sampleAnswers: [
      {
        label: "Claude",
        text: "لحن طبیعی، احترام‌آمیز و بدون کلیشه ترجمه‌ای.",
      },
      {
        label: "ChatGPT",
        text: "بازنویسی کوتاه و واضح با دعوت به اقدام ملایم.",
      },
    ],
    dimensions: dims([3, 5, 5, 4, 5, 3], [4, 5, 4, 5, 5, 3]),
    bestFor: [
      { model: "A", useCase: "فارسی ادبی و ویرایش حرفه‌ای" },
      { model: "B", useCase: "فارسی روزمره و پاسخ سریع" },
    ],
    faq: [
      {
        q: "کدام AI فارسی بهتری دارد؟",
        a: "Claude اغلب در لحن فارسی طبیعی‌تر است؛ GPT همه‌کاره‌تر. بهترین معیار تست زنده با متن خودتان است.",
      },
    ],
    lastUpdated: LAST_UPDATED,
    relatedSlugs: ["chatgpt-vs-claude", "claude-vs-gemini", "best-ai-for-content"],
    cardBlurb: "کدام مدل فارسی روان‌تری دارد؟",
  },
  {
    slug: "best-ai-for-content",
    kind: "usecase",
    title: "بهترین هوش مصنوعی برای تولید محتوا | مقایسه مدل‌ها",
    h1: "بهترین هوش مصنوعی برای تولید محتوا کدام است؟",
    description:
      "مقایسه مدل‌ها برای کپشن، مقاله و ایده‌پردازی محتوا — ChatGPT، Claude و Gemini را در آرایه تست کنید.",
    modelAId: "cmp-gpt-55",
    modelBId: "cmp-claude-opus",
    modelALabel: "ChatGPT (GPT-4o)",
    modelBLabel: "Claude Sonnet 4",
    samplePrompt: "۵ ایده ریلز برای معرفی یک کافه محلی با مخاطب جوان بده.",
    sampleAnswers: [
      {
        label: "ChatGPT",
        text: "ایده‌های کوتاه با هوک، زاویه دوربین و CTA اینستاگرامی.",
      },
      {
        label: "Claude",
        text: "ایده‌های داستانی‌تر با تمرکز روی حس مکان و وفاداری مشتری.",
      },
    ],
    dimensions: dims([4, 5, 4, 4, 5, 3], [3, 5, 5, 4, 5, 3]),
    bestFor: [
      { model: "A", useCase: "ایده سریع، کپشن و واریانت زیاد" },
      { model: "B", useCase: "متن بلند، لحن برند و ویرایش" },
    ],
    faq: [
      {
        q: "برای تولید محتوا کدام مدل را انتخاب کنم؟",
        a: "برای حجم و تنوع GPT؛ برای کیفیت ویرایش Claude. در آرایه هر دو را با یک بریف مقایسه کنید.",
      },
    ],
    lastUpdated: LAST_UPDATED,
    relatedSlugs: ["chatgpt-vs-claude", "chatgpt-vs-gemini", "best-ai-for-persian"],
    cardBlurb: "کدام مدل برای محتوا و کپشن؟",
  },
];

export const COMPARE_HUB = {
  title: "مقایسه هوش مصنوعی | ChatGPT، Claude، Gemini و DeepSeek",
  h1: "مقایسه هوش مصنوعی؛ کدام مدل برای شما بهتر است؟",
  description:
    "جدول و مقایسه زنده ChatGPT، Claude، Gemini و DeepSeek — در هوش مصنوعی آرایه همان‌جا هر دو مدل را تست کنید.",
} as const;

export function getComparePage(slug: string): ComparePageDef | undefined {
  return COMPARE_PAGES.find((p) => p.slug === slug);
}

export function getAllCompareSlugs(): string[] {
  return COMPARE_PAGES.map((p) => p.slug);
}

export function getComparePagePath(slug: string): string {
  return `/ai/compare/${slug}`;
}

export function resolveCompareModels(page: ComparePageDef) {
  return {
    modelA: getModel(page.modelAId),
    modelB: getModel(page.modelBId),
  };
}

export const FEATURED_COMPARE_FOR_HUB = COMPARE_MODELS.filter((m) =>
  ["cmp-gpt-55", "cmp-claude-opus", "cmp-gemini-pro", "cmp-grok-4", "cmp-deepseek-v4"].includes(
    m.id
  )
).map((m) => ({
  id: m.id,
  name: m.name,
  brand: m.brand,
  color: m.color,
  blurb: m.blurb,
}));

export function formatCompareLastUpdated(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function compareTryHref(modelAId: string, modelBId: string): string {
  return `/ai?mode=compare&modelA=${encodeURIComponent(modelAId)}&modelB=${encodeURIComponent(modelBId)}`;
}
