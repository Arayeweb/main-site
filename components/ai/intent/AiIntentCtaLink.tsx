"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackAiLandingCta, type AiLandingCtaKind } from "@/lib/aiTracking";

export default function AiIntentCtaLink({
  landingType,
  cta,
  href,
  className,
  placement = "hero",
  children,
}: {
  landingType: string;
  cta: AiLandingCtaKind;
  href: string;
  className?: string;
  placement?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackAiLandingCta({
          landing_type: landingType,
          cta,
          href,
          placement,
        })
      }
    >
      {children}
    </Link>
  );
}
