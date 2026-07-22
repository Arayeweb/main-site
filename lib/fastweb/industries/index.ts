/**
 * FastWeb programmatic SEO — industry registry (source of truth).
 *
 * Proof industries (quality-gate ready): beauty-salon, gym, law-firm
 * Legacy drafts: routable but reviewed:false → noindex + out of sitemap
 */

import type { FastWebIndustry } from "@/lib/fastweb/industrySchema";
import { parseFastWebIndustry } from "@/lib/fastweb/industrySchema";
import {
  isIndustryPubliclyIndexable,
  assertUniqueIndustryContent,
  evaluateIndustryQualityGate,
} from "@/lib/fastweb/qualityGate";
import { beautySalonIndustry } from "@/lib/fastweb/industries/beautySalon";
import { gymIndustry } from "@/lib/fastweb/industries/gym";
import { lawFirmIndustry } from "@/lib/fastweb/industries/lawFirm";
import { legacyDraftIndustries } from "@/lib/fastweb/industries/legacyDrafts";
import type { FastWebCategoryKey } from "@/lib/fastweb";

export type { FastWebIndustry } from "@/lib/fastweb/industrySchema";
export type { FastWebPageSectionKey, FastWebBlockKey } from "@/lib/fastweb/industrySchema";

const PROOF_INDUSTRIES: FastWebIndustry[] = [
  beautySalonIndustry,
  gymIndustry,
  lawFirmIndustry,
].map((i) => parseFastWebIndustry(i));

export const FASTWEB_INDUSTRIES: FastWebIndustry[] = [
  ...PROOF_INDUSTRIES,
  ...legacyDraftIndustries.map((i) => parseFastWebIndustry(i)),
];

export type FastWebIndustrySlug = (typeof FASTWEB_INDUSTRIES)[number]["slug"];

const slugSet = new Set(FASTWEB_INDUSTRIES.map((i) => i.slug));

/** Industries that are intended to pass the quality gate in this release. */
export const FASTWEB_PROOF_SLUGS = ["beauty-salon", "gym", "law-firm"] as const;
export type FastWebProofSlug = (typeof FASTWEB_PROOF_SLUGS)[number];

export function isFastWebIndustrySlug(slug: string): slug is FastWebIndustrySlug {
  return slugSet.has(slug as FastWebIndustrySlug);
}

export function getFastWebIndustry(slug: string): FastWebIndustry | undefined {
  return FASTWEB_INDUSTRIES.find((i) => i.slug === slug);
}

export function getAllFastWebIndustries(): FastWebIndustry[] {
  return FASTWEB_INDUSTRIES;
}

export function getProofFastWebIndustries(): FastWebIndustry[] {
  return PROOF_INDUSTRIES;
}

/** Publicly indexable = passes quality gate (not merely indexable flag). */
export function getIndexableFastWebIndustries(): FastWebIndustry[] {
  return FASTWEB_INDUSTRIES.filter((i) => isIndustryPubliclyIndexable(i));
}

export function isIndexableFastWebIndustry(slug: string): boolean {
  const industry = getFastWebIndustry(slug);
  if (!industry) return false;
  return isIndustryPubliclyIndexable(industry);
}

export function getFastWebIndustryPath(slug: string): string {
  return `/fastweb/${slug}`;
}

export function getFastWebExamplePath(slug: string): string {
  return `/fastweb/examples/${slug}`;
}

export function getPublishedFastWebIndustryPaths(): string[] {
  return getIndexableFastWebIndustries().map((i) => getFastWebIndustryPath(i.slug));
}

export function getPublishedFastWebExamplePaths(): string[] {
  return getIndexableFastWebIndustries().map((i) => getFastWebExamplePath(i.slug));
}

export function getFastWebIndustryUpdatedAt(slug: string): string | undefined {
  return getFastWebIndustry(slug)?.updatedAt;
}

export function getIndustryOrderHref(
  slug: string,
  source = "fastweb_industry_page",
): string {
  const industry = getFastWebIndustry(slug);
  const params = new URLSearchParams();
  params.set("industry", slug);
  params.set("source", source);
  if (industry?.categoryKey) {
    params.set("category", industry.categoryKey);
  }
  return `/fastweb/new?${params.toString()}`;
}

export function mapIndustryToCategoryKey(slug: string): FastWebCategoryKey | undefined {
  return getFastWebIndustry(slug)?.categoryKey;
}

/** Slugs that must NOT have a competing /website/[industry] equivalent. */
export const FASTWEB_EXCLUSIVE_SLUGS = FASTWEB_INDUSTRIES.map((i) => i.slug);

export function validateFastWebIndustryRegistry(): {
  ok: boolean;
  gateFailures: { slug: string; reasons: string[] }[];
  uniquenessFailures: ReturnType<typeof assertUniqueIndustryContent>;
} {
  const gateFailures = FASTWEB_INDUSTRIES.filter((i) => i.indexable && i.reviewed)
    .map((i) => ({ slug: i.slug, reasons: evaluateIndustryQualityGate(i).reasons }))
    .filter((f) => f.reasons.length > 0);

  const uniquenessFailures = assertUniqueIndustryContent(PROOF_INDUSTRIES);

  return {
    ok: gateFailures.length === 0 && uniquenessFailures.length === 0,
    gateFailures,
    uniquenessFailures,
  };
}

// Re-export gate helpers for tests/routes
export { isIndustryPubliclyIndexable, evaluateIndustryQualityGate };
