export interface CampaignPageContent {
  headline: string;
  subheadline: string;
  problemBullets: string[];
  benefits: string[];
  offerSection: {
    title: string;
    description: string;
    bullets: string[];
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
  objections: Array<{
    objection: string;
    response: string;
  }>;
  ctaText: string;
  formTitle: string;
  thankYouMessage: string;
  adCopyAngles: Array<{
    channel: string;
    angle: string;
    copy: string;
  }>;
  whatsappMessage: string;
}

export type CampaignContentValidation =
  | { success: true; data: CampaignPageContent }
  | { success: false; errors: string[] };

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validText(value: unknown, max = 2_000): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function validTextArray(
  value: unknown,
  options: { min?: number; max?: number; itemMax?: number } = {}
): value is string[] {
  const min = options.min ?? 1;
  const max = options.max ?? 10;
  const itemMax = options.itemMax ?? 500;
  return (
    Array.isArray(value) &&
    value.length >= min &&
    value.length <= max &&
    value.every((item) => validText(item, itemMax))
  );
}

export function validateCampaignPageContent(value: unknown): CampaignContentValidation {
  const errors: string[] = [];
  if (!isObject(value)) {
    return { success: false, errors: ["root باید یک شیء JSON باشد"] };
  }

  if (!validText(value.headline, 180)) errors.push("headline نامعتبر است");
  if (!validText(value.subheadline, 500)) errors.push("subheadline نامعتبر است");
  if (!validTextArray(value.problemBullets, { min: 2, max: 6 })) {
    errors.push("problemBullets باید ۲ تا ۶ مورد داشته باشد");
  }
  if (!validTextArray(value.benefits, { min: 3, max: 8 })) {
    errors.push("benefits باید ۳ تا ۸ مورد داشته باشد");
  }

  if (!isObject(value.offerSection)) {
    errors.push("offerSection نامعتبر است");
  } else {
    if (!validText(value.offerSection.title, 180)) {
      errors.push("offerSection.title نامعتبر است");
    }
    if (!validText(value.offerSection.description, 1_000)) {
      errors.push("offerSection.description نامعتبر است");
    }
    if (!validTextArray(value.offerSection.bullets, { min: 2, max: 6 })) {
      errors.push("offerSection.bullets باید ۲ تا ۶ مورد داشته باشد");
    }
  }

  if (!Array.isArray(value.faq) || value.faq.length < 2 || value.faq.length > 8) {
    errors.push("faq باید ۲ تا ۸ مورد داشته باشد");
  } else if (
    !value.faq.every(
      (item) =>
        isObject(item) &&
        validText(item.question, 300) &&
        validText(item.answer, 1_000)
    )
  ) {
    errors.push("ساختار faq نامعتبر است");
  }

  if (
    !Array.isArray(value.objections) ||
    value.objections.length < 2 ||
    value.objections.length > 8
  ) {
    errors.push("objections باید ۲ تا ۸ مورد داشته باشد");
  } else if (
    !value.objections.every(
      (item) =>
        isObject(item) &&
        validText(item.objection, 300) &&
        validText(item.response, 1_000)
    )
  ) {
    errors.push("ساختار objections نامعتبر است");
  }

  if (!validText(value.ctaText, 120)) errors.push("ctaText نامعتبر است");
  if (!validText(value.formTitle, 180)) errors.push("formTitle نامعتبر است");
  if (!validText(value.thankYouMessage, 500)) {
    errors.push("thankYouMessage نامعتبر است");
  }

  if (
    !Array.isArray(value.adCopyAngles) ||
    value.adCopyAngles.length < 1 ||
    value.adCopyAngles.length > 6
  ) {
    errors.push("adCopyAngles باید ۱ تا ۶ مورد داشته باشد");
  } else if (
    !value.adCopyAngles.every(
      (item) =>
        isObject(item) &&
        validText(item.channel, 100) &&
        validText(item.angle, 200) &&
        validText(item.copy, 1_500)
    )
  ) {
    errors.push("ساختار adCopyAngles نامعتبر است");
  }

  if (!validText(value.whatsappMessage, 1_000)) {
    errors.push("whatsappMessage نامعتبر است");
  }

  if (errors.length > 0) return { success: false, errors };
  return { success: true, data: value as unknown as CampaignPageContent };
}

export function parseCampaignPageContent(raw: string): CampaignContentValidation {
  const withoutFence = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const firstBrace = withoutFence.indexOf("{");
  const lastBrace = withoutFence.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) {
    return { success: false, errors: ["پاسخ مدل JSON قابل استخراج ندارد"] };
  }

  try {
    return validateCampaignPageContent(
      JSON.parse(withoutFence.slice(firstBrace, lastBrace + 1))
    );
  } catch {
    return { success: false, errors: ["پاسخ مدل JSON معتبر نیست"] };
  }
}

export function hasGeneratedCampaignContent(value: unknown): value is CampaignPageContent {
  return validateCampaignPageContent(value).success;
}
