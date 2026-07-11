import { ADREADY_HERO_SAMPLE } from "@/lib/adreadyLandingSamples";
import { AdReadyLandingPreview } from "./AdReadyLandingPreview";

export default function AdReadyHeroMockup() {
  return (
    <div className="adready-hero-preview" aria-label="نمونه صفحه ساخته‌شده با AdReady">
      <AdReadyLandingPreview sample={ADREADY_HERO_SAMPLE} variant="featured" />
    </div>
  );
}
