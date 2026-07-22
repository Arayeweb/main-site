import { z } from "zod";

/** Ordered page sections — each industry chooses its own sequence. */
export const FASTWEB_PAGE_SECTION_KEYS = [
  "hero",
  "outcomes",
  "problems",
  "blueprint",
  "requiredBlocks",
  "designDirections",
  "example",
  "deliverables",
  "exclusions",
  "process",
  "pricing",
  "faq",
  "related",
  "finalCta",
] as const;

export type FastWebPageSectionKey = (typeof FASTWEB_PAGE_SECTION_KEYS)[number];

export const FASTWEB_BLOCK_KEYS = [
  "services",
  "gallery",
  "beforeAfter",
  "pricing",
  "booking",
  "team",
  "schedule",
  "transformations",
  "practiceAreas",
  "credentials",
  "process",
  "testimonials",
  "faq",
  "contact",
  "hours",
  "map",
  "about",
] as const;

export type FastWebBlockKey = (typeof FASTWEB_BLOCK_KEYS)[number];

export const FASTWEB_DESIGN_DIRECTION_KEYS = [
  "warm",
  "formal",
  "modern",
  "bold",
  "editorial",
] as const;

const faqSchema = z.object({
  question: z.string().min(8),
  answer: z.string().min(20),
});

const exampleSchema = z.object({
  slug: z.string().min(2),
  conceptName: z.string().min(2),
  isConceptual: z.literal(true),
  disclaimer: z.string().min(10),
  businessGoal: z.string().min(10),
  visualStyle: z.string().min(4),
  whyStructure: z.string().min(20),
  includedBlocks: z.array(z.enum(FASTWEB_BLOCK_KEYS)).min(3),
  desktopCaption: z.string().min(4),
  mobileCaption: z.string().min(4),
});

const designDirectionSchema = z.object({
  key: z.enum(FASTWEB_DESIGN_DIRECTION_KEYS),
  label: z.string().min(2),
  description: z.string().min(12),
  bestFor: z.string().min(8),
});

const imageDirectionSchema = z.object({
  photographyStyle: z.string().min(8),
  lighting: z.string().min(4),
  composition: z.string().min(8),
  colorPalette: z.string().min(8),
  avoid: z.array(z.string().min(3)).min(2),
});

export const fastWebIndustrySchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(2),
  shortName: z.string().min(2),
  /** Wizard category key — maps SEO industry → sellable template category. */
  categoryKey: z.enum([
    "service-business",
    "professional",
    "online-store",
    "restaurant-cafe",
    "company-b2b",
    "beauty-salon",
    "gym-fitness",
    "law-firm",
    "real-estate",
    "education",
  ]),
  searchTerms: z.array(z.string().min(3)).min(2),
  searchIntent: z.string().min(20),
  audience: z.array(z.string().min(3)).min(1),
  primaryGoal: z.string().min(8),
  primaryCta: z.string().min(4),
  secondaryCta: z.string().min(4),
  hero: z.object({
    eyebrow: z.string().optional(),
    title: z.string().min(8),
    description: z.string().min(20),
  }),
  problems: z
    .array(
      z.object({
        title: z.string().min(6),
        description: z.string().min(20),
      }),
    )
    .min(3),
  outcomes: z
    .array(
      z.object({
        title: z.string().min(4),
        description: z.string().min(16),
      }),
    )
    .min(3),
  /** Controls industry page section order — must include hero + finalCta. */
  sectionOrder: z.array(z.enum(FASTWEB_PAGE_SECTION_KEYS)).min(8),
  blueprint: z.array(z.enum(FASTWEB_BLOCK_KEYS)).min(4),
  requiredBlocks: z
    .array(
      z.object({
        key: z.enum(FASTWEB_BLOCK_KEYS),
        title: z.string().min(3),
        description: z.string().min(12),
      }),
    )
    .min(4),
  optionalBlocks: z.array(z.enum(FASTWEB_BLOCK_KEYS)),
  designDirections: z.array(designDirectionSchema).min(2).max(3),
  imageDirection: imageDirectionSchema,
  deliverables: z.array(z.string().min(4)).min(4),
  exclusions: z.array(z.string().min(4)).min(3),
  examples: z.array(exampleSchema).min(1),
  faqs: z.array(faqSchema).min(3),
  relatedIndustries: z.array(z.string().min(2)).min(1),
  relatedGuides: z.array(z.string()).default([]),
  metadata: z.object({
    title: z.string().min(12),
    description: z.string().min(40).max(170),
    h1: z.string().min(8),
  }),
  /** Visual language for the industry page itself (not the generated site). */
  pageTone: z.enum(["warm", "energetic", "formal"]),
  hubAnchor: z.string().min(4),
  advancedProjectRoute: z.string().min(1),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  indexable: z.boolean(),
  reviewed: z.boolean(),
  reviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type FastWebIndustry = z.infer<typeof fastWebIndustrySchema>;

export type FastWebIndustrySlug = FastWebIndustry["slug"];

export function parseFastWebIndustry(input: unknown): FastWebIndustry {
  return fastWebIndustrySchema.parse(input);
}

export function safeParseFastWebIndustry(input: unknown) {
  return fastWebIndustrySchema.safeParse(input);
}
