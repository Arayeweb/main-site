import type { IndustrySlug } from "./industries";
import type { ServiceType } from "./pageContent";

export const INDEXABLE_FOR_MVP = [
  { serviceType: "seo" as const, slug: "doctor" as IndustrySlug },
  { serviceType: "website" as const, slug: "doctor" as IndustrySlug },
  { serviceType: "seo" as const, slug: "clinic" as IndustrySlug },
  { serviceType: "website" as const, slug: "clinic" as IndustrySlug },
] as const;

export function isIndexableMvp(serviceType: ServiceType, slug: IndustrySlug) {
  return INDEXABLE_FOR_MVP.some((p) => p.serviceType === serviceType && p.slug === slug);
}

