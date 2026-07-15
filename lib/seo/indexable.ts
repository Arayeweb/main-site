import type { IndustrySlug } from "./industries";
import type { ServiceType } from "./pageContent";
import { isPublishedIndustryPage } from "./programmaticPages";

/** @deprecated Use isPublishedIndustryPage — kept for backward compatibility. */
export function isIndexableMvp(serviceType: ServiceType, slug: IndustrySlug) {
  return isPublishedIndustryPage(serviceType, slug);
}
