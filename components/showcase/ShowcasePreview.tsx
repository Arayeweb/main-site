import { GoogleEmdadAhanShowcase, GoogleShoopeShowcase } from "./GoogleShowcases";

type LegacyPreviewKey = "google-shoope" | "google-emdad-ahan";

const LEGACY_PREVIEWS = {
  "google-shoope": GoogleShoopeShowcase,
  "google-emdad-ahan": GoogleEmdadAhanShowcase,
} as const;

export function ShowcasePreview({
  sampleKey,
  compact = false,
}: {
  sampleKey: LegacyPreviewKey;
  compact?: boolean;
}) {
  const Preview = LEGACY_PREVIEWS[sampleKey];
  return <Preview compact={compact} />;
}

export function ShowcaseFull({ sampleKey }: { sampleKey: LegacyPreviewKey }) {
  const Preview = LEGACY_PREVIEWS[sampleKey];
  return <Preview />;
}
