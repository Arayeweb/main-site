import type { FastWebIndustry } from "@/lib/fastweb/industrySchema";
import { safeParseFastWebIndustry } from "@/lib/fastweb/industrySchema";

export type QualityGateFailure = {
  slug: string;
  reasons: string[];
};

const PLACEHOLDER_MARKERS = [
  "lorem",
  "placeholder",
  "TODO",
  "TBD",
  "xxx",
  "متن نمونه",
  "جایگزین شود",
  "coming soon",
];

function hasPlaceholder(text: string): boolean {
  const lower = text.toLowerCase();
  return PLACEHOLDER_MARKERS.some((m) => lower.includes(m.toLowerCase()));
}

function collectText(industry: FastWebIndustry): string[] {
  return [
    industry.metadata.title,
    industry.metadata.description,
    industry.metadata.h1,
    industry.hero.title,
    industry.hero.description,
    industry.searchIntent,
    industry.primaryCta,
    ...industry.problems.flatMap((p) => [p.title, p.description]),
    ...industry.outcomes.flatMap((o) => [o.title, o.description]),
    ...industry.faqs.flatMap((f) => [f.question, f.answer]),
    ...industry.examples.flatMap((e) => [
      e.conceptName,
      e.businessGoal,
      e.whyStructure,
      e.disclaimer,
    ]),
  ];
}

/**
 * Index quality gate.
 * A page is publicly indexable only when flags are set AND content passes checks.
 * Failing pages MUST use robots noindex,follow and MUST NOT appear in sitemap.
 */
export function evaluateIndustryQualityGate(
  industry: FastWebIndustry,
): { pass: boolean; reasons: string[] } {
  const reasons: string[] = [];

  const parsed = safeParseFastWebIndustry(industry);
  if (!parsed.success) {
    reasons.push("schema_validation_failed");
    return { pass: false, reasons };
  }

  if (!industry.indexable) reasons.push("indexable_flag_false");
  if (!industry.reviewed) reasons.push("not_reviewed");
  if (!industry.reviewedAt) reasons.push("missing_reviewed_at");

  if (!industry.sectionOrder.includes("hero")) reasons.push("missing_hero_section");
  if (!industry.sectionOrder.includes("finalCta")) reasons.push("missing_final_cta_section");
  if (!industry.sectionOrder.includes("blueprint")) reasons.push("missing_blueprint_section");
  if (!industry.sectionOrder.includes("faq")) reasons.push("missing_faq_section");

  if (industry.examples.length < 1) reasons.push("missing_example");
  if (industry.blueprint.length < 4) reasons.push("blueprint_too_short");
  if (industry.problems.length < 3) reasons.push("problems_too_few");
  if (industry.outcomes.length < 3) reasons.push("outcomes_too_few");
  if (industry.relatedIndustries.length < 1) reasons.push("missing_internal_links");

  // Hero/CTA/H1 must not be generic name-swap patterns
  const nameTokens = [industry.name, industry.shortName].filter(Boolean);
  const heroLooksLikeSwap =
    industry.hero.title === `طراحی سایت ${industry.name}` ||
    industry.metadata.h1 === `طراحی سایت ${industry.name}`;
  if (heroLooksLikeSwap) reasons.push("generic_name_swap_copy");

  for (const text of collectText(industry)) {
    if (hasPlaceholder(text)) {
      reasons.push("placeholder_copy");
      break;
    }
  }

  // Cannibalization soft check — medical routes stay noindex until strategy is explicit
  const medicalSlugs = new Set(["psychologist", "doctor", "clinic", "dentist"]);
  if (medicalSlugs.has(industry.slug) && industry.indexable) {
    reasons.push("medical_cannibalization_hold");
  }

  void nameTokens;
  return { pass: reasons.length === 0, reasons };
}

export function isIndustryPubliclyIndexable(industry: FastWebIndustry): boolean {
  return evaluateIndustryQualityGate(industry).pass;
}

export function assertUniqueIndustryContent(industries: FastWebIndustry[]): QualityGateFailure[] {
  const failures: QualityGateFailure[] = [];
  const titles = new Map<string, string>();
  const h1s = new Map<string, string>();
  const intents = new Map<string, string>();
  const heroes = new Map<string, string>();
  const ctas = new Map<string, string>();
  const orders = new Map<string, string>();

  for (const industry of industries) {
    const reasons: string[] = [];
    const titleKey = industry.metadata.title;
    const h1Key = industry.metadata.h1;
    const intentKey = industry.searchIntent;
    const heroKey = industry.hero.description;
    const ctaKey = industry.primaryCta;
    const orderKey = industry.sectionOrder.join(">");

    if (titles.has(titleKey)) reasons.push(`duplicate_title:${titles.get(titleKey)}`);
    else titles.set(titleKey, industry.slug);

    if (h1s.has(h1Key)) reasons.push(`duplicate_h1:${h1s.get(h1Key)}`);
    else h1s.set(h1Key, industry.slug);

    if (intents.has(intentKey)) reasons.push(`duplicate_intent:${intents.get(intentKey)}`);
    else intents.set(intentKey, industry.slug);

    if (heroes.has(heroKey)) reasons.push(`duplicate_hero:${heroes.get(heroKey)}`);
    else heroes.set(heroKey, industry.slug);

    if (ctas.has(ctaKey)) reasons.push(`duplicate_cta:${ctas.get(ctaKey)}`);
    else ctas.set(ctaKey, industry.slug);

    if (orders.has(orderKey)) reasons.push(`duplicate_section_order:${orders.get(orderKey)}`);
    else orders.set(orderKey, industry.slug);

    if (reasons.length) failures.push({ slug: industry.slug, reasons });
  }

  return failures;
}
