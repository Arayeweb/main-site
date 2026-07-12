import type {
  FastWebBrief,
  FastWebFaqItem,
  FastWebOfferingItem,
  FastWebPreviewContent,
  FastWebSectionId,
  FastWebStyleId,
  FastWebTemplateKey,
} from "@/lib/fastweb";
import {
  FASTWEB_TEMPLATE_KEYS,
  FASTWEB_STYLES,
  pickTemplateKey,
  suggestedSectionsForGoal,
} from "@/lib/fastweb";

function asString(v: unknown, max = 500): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function asStringArray(v: unknown, maxItems = 8, maxLen = 200): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => asString(item, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

function asOfferings(v: unknown): FastWebOfferingItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const title = asString(row.title, 80);
      const description = asString(row.description, 240);
      if (!title) return null;
      return { title, description };
    })
    .filter((x): x is FastWebOfferingItem => Boolean(x))
    .slice(0, 7);
}

function asFaq(v: unknown): FastWebFaqItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const question = asString(row.question, 160);
      const answer = asString(row.answer, 400);
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((x): x is FastWebFaqItem => Boolean(x))
    .slice(0, 6);
}

function asTestimonials(
  v: unknown
): { name: string; text: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = asString(row.name, 60);
      const text = asString(row.text, 280);
      if (!name || !text) return null;
      return { name, text };
    })
    .filter((x): x is { name: string; text: string } => Boolean(x))
    .slice(0, 4);
}

function asSections(v: unknown): FastWebSectionId[] {
  if (!Array.isArray(v)) return ["hero", "about", "contact"];
  const allowed = new Set([
    "hero",
    "services",
    "products",
    "about",
    "portfolio",
    "testimonials",
    "faq",
    "contact",
  ]);
  const out: FastWebSectionId[] = [];
  for (const item of v) {
    if (typeof item === "string" && allowed.has(item)) {
      out.push(item as FastWebSectionId);
    }
  }
  if (!out.includes("hero")) out.unshift("hero");
  if (!out.includes("contact")) out.push("contact");
  return out.slice(0, 7);
}

function asTemplateKey(v: unknown): FastWebTemplateKey {
  if (
    typeof v === "string" &&
    (FASTWEB_TEMPLATE_KEYS as readonly string[]).includes(v)
  ) {
    return v as FastWebTemplateKey;
  }
  return "local-business";
}

function asStyleKey(v: unknown): FastWebStyleId {
  if (
    typeof v === "string" &&
    FASTWEB_STYLES.some((s) => s.id === v)
  ) {
    return v as FastWebStyleId;
  }
  return "modern";
}

function asColor(v: unknown, fallback = "#0F4C5C"): string {
  const s = asString(v, 20);
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  return fallback;
}

export function parseFastWebPreviewContent(
  raw: unknown
): { ok: true; content: FastWebPreviewContent } | { ok: false; errors: string[] } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, errors: ["content_not_object"] };
  }
  const row = raw as Record<string, unknown>;
  const errors: string[] = [];
  const headline = asString(row.headline, 120);
  const subheadline = asString(row.subheadline, 220);
  if (!headline) errors.push("headline_required");
  if (!subheadline) errors.push("subheadline_required");

  const content: FastWebPreviewContent = {
    headline: headline || "کسب‌وکار شما",
    subheadline: subheadline || "معرفی خدمات و راه‌های تماس",
    aboutText: asString(row.aboutText, 600) || "درباره کسب‌وکار به‌زودی تکمیل می‌شود.",
    offerings: asOfferings(row.offerings),
    portfolioNotes: asStringArray(row.portfolioNotes, 6, 160),
    testimonials: asTestimonials(row.testimonials),
    faq: asFaq(row.faq),
    ctaText: asString(row.ctaText, 60) || "درخواست مشاوره",
    formTitle: asString(row.formTitle, 80) || "فرم درخواست",
    seoTitle: asString(row.seoTitle, 70) || headline || "سایت کسب‌وکار",
    seoDescription:
      asString(row.seoDescription, 160) ||
      subheadline ||
      "سایت معرفی کسب‌وکار",
    templateKey: asTemplateKey(row.templateKey),
    styleKey: asStyleKey(row.styleKey),
    brandColor: asColor(row.brandColor),
    sections: asSections(row.sections),
  };

  if (content.offerings.length === 0) {
    content.offerings = [
      { title: "خدمت اصلی", description: "توضیح کوتاه خدمت یا محصول" },
    ];
  }
  if (content.faq.length === 0) {
    content.faq = [
      {
        question: "چطور می‌توانم درخواست بدهم؟",
        answer: "از طریق فرم تماس یا واتساپ با ما در ارتباط باشید.",
      },
    ];
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, content };
}

export function hasPreviewContent(
  content: Partial<FastWebPreviewContent> | null | undefined
): boolean {
  return Boolean(content?.headline && content?.subheadline);
}

/**
 * Deterministic preview built directly from the brief — no AI.
 * Since the final site is produced by hand, this shows the real template,
 * brand color and the customer's own inputs as a structural mockup.
 * The team writes the polished copy during manual delivery.
 */
export function buildDraftPreview(brief: FastWebBrief): FastWebPreviewContent {
  const name = brief.businessName?.trim() || "کسب‌وکار شما";
  const city = brief.city?.trim();
  const advantage = brief.mainAdvantage?.trim();
  const shortDescription = brief.shortDescription?.trim();

  const offeringsRaw = (brief.offerings || "")
    .split(/[\n,،]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
  const offerings: FastWebOfferingItem[] =
    offeringsRaw.length > 0
      ? offeringsRaw.map((title) => ({
          title,
          description: advantage || "توضیح این مورد در نسخه نهایی تکمیل می‌شود.",
        }))
      : [
          {
            title: "خدمت یا محصول اصلی",
            description: shortDescription || "توضیح کوتاه در نسخه نهایی تکمیل می‌شود.",
          },
        ];

  const style = (brief.style || "modern") as FastWebStyleId;
  const templateKey = pickTemplateKey(brief);
  const sections = (
    brief.sections?.length ? brief.sections : suggestedSectionsForGoal(brief.goal)
  ).slice(0, 7) as FastWebSectionId[];

  const faq: FastWebFaqItem[] = [
    {
      question: "چطور می‌توانم با شما تماس بگیرم؟",
      answer: "از طریق شماره تماس، واتساپ یا فرم درخواست در همین صفحه.",
    },
    {
      question: "محدوده فعالیت کجاست؟",
      answer: city ? `عمدتاً در ${city} و اطراف آن.` : "برای محدوده دقیق با ما تماس بگیرید.",
    },
    {
      question: "برای شروع چه کنم؟",
      answer: "فرم درخواست را پر کنید؛ در اولین فرصت پاسخ می‌دهیم.",
    },
  ];

  return {
    headline: city ? `${name} در ${city}` : name,
    subheadline:
      shortDescription ||
      advantage ||
      "معرفی خدمات و راه‌های ارتباط سریع با ما",
    aboutText:
      shortDescription ||
      `${name} آماده ارائه خدمات به ${brief.audience?.trim() || "مشتریان"} است.`,
    offerings,
    portfolioNotes: [],
    testimonials: [],
    faq,
    ctaText: "ثبت درخواست",
    formTitle: "فرم درخواست",
    seoTitle: city ? `${name} | ${city}` : name,
    seoDescription: (shortDescription || `سایت معرفی ${name}`).slice(0, 150),
    templateKey,
    styleKey: style,
    brandColor: brief.brandColor || "#0F4C5C",
    sections,
  };
}
