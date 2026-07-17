"use client";

import Link from "next/link";
import { trackAiLandingCta } from "@/lib/aiTracking";

export default function AiIntentStickyCta({
  landingType,
  primaryHref,
  secondaryHref,
}: {
  landingType: string;
  primaryHref: string;
  secondaryHref: string;
}) {
  return (
    <div className="ail-sticky" aria-label="اقدام سریع">
      <Link
        href={primaryHref}
        className="ar-btn ar-btn-primary ar-btn-sm"
        onClick={() =>
          trackAiLandingCta({
            landing_type: landingType,
            cta: "primary",
            href: primaryHref,
            placement: "sticky",
          })
        }
      >
        رایگان امتحان کن
      </Link>
      <Link
        href={secondaryHref}
        className="ar-btn ar-btn-ghost ar-btn-sm"
        onClick={() =>
          trackAiLandingCta({
            landing_type: landingType,
            cta: "secondary",
            href: secondaryHref,
            placement: "sticky",
          })
        }
      >
        مقایسه مدل‌ها
      </Link>
    </div>
  );
}
