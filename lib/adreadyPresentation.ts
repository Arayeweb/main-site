import {
  validateCampaignPageContent,
  type CampaignPageContent,
} from "@/lib/adreadyContent";
import { isPlainObject, readString, type JsonObject } from "@/lib/adready";

export const ADREADY_TEMPLATE_KEYS = [
  "clean-service",
  "local-business",
  "online-shop",
  "clinic",
  "education",
  "saas",
] as const;

export const ADREADY_THEME_KEYS = [
  "default",
  "dark",
  "premium",
  "warm",
  "minimal",
] as const;

export type AdReadyTemplateKey = (typeof ADREADY_TEMPLATE_KEYS)[number];
export type AdReadyThemeKey = (typeof ADREADY_THEME_KEYS)[number];

export interface CampaignPresentationContent {
  headline: string;
  subheadline: string;
  problemBullets: string[];
  benefits: string[];
  offerSection: {
    title: string;
    description: string;
    bullets: string[];
  };
  faq: Array<{ question: string; answer: string }>;
  objections: Array<{ objection: string; response: string }>;
  ctaText: string;
  formTitle: string;
  thankYouMessage: string;
  adCopyAngles: Array<{ channel: string; angle: string; copy: string }>;
  whatsappMessage: string;
}

export interface CampaignPresentationUpdate {
  customContent: Omit<CampaignPresentationContent, "adCopyAngles">;
  contactPhone: string | null;
  whatsappNumber: string | null;
  telegramUsername: string | null;
  templateKey: AdReadyTemplateKey;
  themeKey: AdReadyThemeKey;
}

export type CampaignPresentationValidation =
  | { ok: true; value: CampaignPresentationUpdate }
  | { ok: false; error: string };

const EMPTY_CONTENT: CampaignPresentationContent = {
  headline: "",
  subheadline: "",
  problemBullets: [],
  benefits: [],
  offerSection: { title: "", description: "", bullets: [] },
  faq: [],
  objections: [],
  ctaText: "",
  formTitle: "",
  thankYouMessage: "",
  adCopyAngles: [],
  whatsappMessage: "",
};

const TEMPLATE_ALIASES: Record<string, AdReadyTemplateKey> = {
  "clean service": "clean-service",
  "local business": "local-business",
  "online shop": "online-shop",
  clinic: "clinic",
  education: "education",
  saas: "saas",
};

export function normalizeAdReadyTemplateKey(value: unknown): AdReadyTemplateKey {
  if (typeof value !== "string") return "clean-service";
  const normalized = value.trim().toLowerCase();
  if (ADREADY_TEMPLATE_KEYS.includes(normalized as AdReadyTemplateKey)) {
    return normalized as AdReadyTemplateKey;
  }
  return TEMPLATE_ALIASES[normalized] || "clean-service";
}

export function normalizeAdReadyThemeKey(value: unknown): AdReadyThemeKey {
  if (
    typeof value === "string" &&
    ADREADY_THEME_KEYS.includes(value.trim().toLowerCase() as AdReadyThemeKey)
  ) {
    return value.trim().toLowerCase() as AdReadyThemeKey;
  }
  return "default";
}

function text(value: unknown, max: number, fallback = ""): string {
  return readString(value, max) ?? fallback;
}

function textList(value: unknown, maxItems: number, itemMax: number): string[] | null {
  if (!Array.isArray(value) || value.length > maxItems) return null;
  const items: string[] = [];
  for (const item of value) {
    const parsed = readString(item, itemMax);
    if (!parsed) return null;
    items.push(parsed);
  }
  return items;
}

function faqList(
  value: unknown
): Array<{ question: string; answer: string }> | null {
  if (!Array.isArray(value) || value.length > 12) return null;
  const items: Array<{ question: string; answer: string }> = [];
  for (const item of value) {
    if (!isPlainObject(item)) return null;
    const question = readString(item.question, 300);
    const answer = readString(item.answer, 1200);
    if (!question || !answer) return null;
    items.push({ question, answer });
  }
  return items;
}

function objectionList(
  value: unknown
): Array<{ objection: string; response: string }> | null {
  if (!Array.isArray(value) || value.length > 12) return null;
  const items: Array<{ objection: string; response: string }> = [];
  for (const item of value) {
    if (!isPlainObject(item)) return null;
    const objection = readString(item.objection, 300);
    const response = readString(item.response, 1200);
    if (!objection || !response) return null;
    items.push({ objection, response });
  }
  return items;
}

function adCopyList(
  value: unknown
): Array<{ channel: string; angle: string; copy: string }> | null {
  if (!Array.isArray(value) || value.length > 8) return null;
  const items: Array<{ channel: string; angle: string; copy: string }> = [];
  for (const item of value) {
    if (!isPlainObject(item)) return null;
    const channel = readString(item.channel, 100);
    const angle = readString(item.angle, 300);
    const copy = readString(item.copy, 1800);
    if (!channel || !angle || !copy) return null;
    items.push({ channel, angle, copy });
  }
  return items;
}

function safeGeneratedContent(value: unknown): CampaignPresentationContent {
  const validation = validateCampaignPageContent(value);
  return validation.success
    ? validation.data
    : {
        ...EMPTY_CONTENT,
        offerSection: { ...EMPTY_CONTENT.offerSection },
      };
}

export function mergeCampaignPresentation(
  generatedContent: unknown,
  customContent: unknown
): CampaignPresentationContent {
  const base = safeGeneratedContent(generatedContent);
  if (!isPlainObject(customContent)) return base;

  const problemBullets = textList(customContent.problemBullets, 10, 400);
  const benefits = textList(customContent.benefits, 12, 400);
  const faq = faqList(customContent.faq);
  const objections = objectionList(customContent.objections);
  const adCopyAngles = adCopyList(customContent.adCopyAngles);
  const customOffer = isPlainObject(customContent.offerSection)
    ? customContent.offerSection
    : null;
  const offerBullets = customOffer
    ? textList(customOffer.bullets, 10, 400)
    : null;

  return {
    headline:
      "headline" in customContent
        ? text(customContent.headline, 180)
        : base.headline,
    subheadline:
      "subheadline" in customContent
        ? text(customContent.subheadline, 600)
        : base.subheadline,
    problemBullets: problemBullets ?? base.problemBullets,
    benefits: benefits ?? base.benefits,
    offerSection: {
      title:
        customOffer && "title" in customOffer
          ? text(customOffer.title, 180)
          : base.offerSection.title,
      description:
        customOffer && "description" in customOffer
          ? text(customOffer.description, 1200)
          : base.offerSection.description,
      bullets: offerBullets ?? base.offerSection.bullets,
    },
    faq: faq ?? base.faq,
    objections: objections ?? base.objections,
    ctaText:
      "ctaText" in customContent
        ? text(customContent.ctaText, 120)
        : base.ctaText,
    formTitle:
      "formTitle" in customContent
        ? text(customContent.formTitle, 180)
        : base.formTitle,
    thankYouMessage:
      "thankYouMessage" in customContent
        ? text(customContent.thankYouMessage, 600)
        : base.thankYouMessage,
    adCopyAngles: adCopyAngles ?? base.adCopyAngles,
    whatsappMessage:
      "whatsappMessage" in customContent
        ? text(customContent.whatsappMessage, 1200)
        : base.whatsappMessage,
  };
}

function validPhone(value: string): boolean {
  return /^\+?[0-9۰-۹٠-٩\s()\-]{7,24}$/.test(value);
}

function validTelegram(value: string): boolean {
  return /^@?[a-zA-Z0-9_]{5,32}$/.test(value);
}

export function validateCampaignPresentationUpdate(
  body: JsonObject
): CampaignPresentationValidation {
  if (!isPlainObject(body.content)) {
    return { ok: false, error: "invalid_content" };
  }
  const content = body.content;
  const headline = readString(content.headline, 180);
  const subheadline = readString(content.subheadline, 600);
  const ctaText = readString(content.ctaText, 120);
  const benefits = textList(content.benefits, 12, 400);
  const problemBullets = textList(content.problemBullets, 10, 400);
  const faq = faqList(content.faq);
  const objections = objectionList(content.objections);
  if (!headline || !subheadline || !ctaText || !benefits?.length) {
    return { ok: false, error: "missing_required_public_content" };
  }
  if (!problemBullets || !faq || !objections) {
    return { ok: false, error: "invalid_content_structure" };
  }

  const offer = content.offerSection;
  if (!isPlainObject(offer)) {
    return { ok: false, error: "invalid_offer" };
  }
  const offerBullets = textList(offer.bullets, 10, 400);
  if (!offerBullets) return { ok: false, error: "invalid_offer" };

  const contactPhone = readString(body.contactPhone, 40);
  const whatsappNumber = readString(body.whatsappNumber, 40);
  const telegramUsername = readString(body.telegramUsername, 120);
  if (!contactPhone && !whatsappNumber && !telegramUsername) {
    return { ok: false, error: "missing_contact_method" };
  }
  if (
    (contactPhone && !validPhone(contactPhone)) ||
    (whatsappNumber && !validPhone(whatsappNumber)) ||
    (telegramUsername && !validTelegram(telegramUsername))
  ) {
    return { ok: false, error: "invalid_contact_method" };
  }

  return {
    ok: true,
    value: {
      customContent: {
        headline,
        subheadline,
        problemBullets,
        benefits,
        offerSection: {
          title: text(offer.title, 180),
          description: text(offer.description, 1200),
          bullets: offerBullets,
        },
        faq,
        objections,
        ctaText,
        formTitle: text(content.formTitle, 180),
        thankYouMessage: text(content.thankYouMessage, 600),
        whatsappMessage: text(content.whatsappMessage, 1200),
      },
      contactPhone,
      whatsappNumber,
      telegramUsername,
      templateKey: normalizeAdReadyTemplateKey(body.templateKey),
      themeKey: normalizeAdReadyThemeKey(body.themeKey),
    },
  };
}

export function hasRequiredPublicPresentation(
  content: CampaignPresentationContent,
  contacts: {
    contactPhone?: string | null;
    whatsappNumber?: string | null;
    telegramUsername?: string | null;
  }
): boolean {
  return Boolean(
    content.headline &&
      content.subheadline &&
      content.ctaText &&
      content.benefits.length > 0 &&
      (contacts.contactPhone || contacts.whatsappNumber || contacts.telegramUsername)
  );
}

export function campaignContentForEdit(
  generatedContent: unknown,
  customContent: unknown
): Omit<CampaignPresentationContent, "adCopyAngles"> {
  const merged = mergeCampaignPresentation(generatedContent, customContent);
  const { adCopyAngles: _adCopyAngles, ...editable } = merged;
  return editable;
}

export type { CampaignPageContent };
