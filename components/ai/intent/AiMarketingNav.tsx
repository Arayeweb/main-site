"use client";

import Link from "next/link";
import {
  trackAiLandingCta,
  type AiLandingCtaKind,
} from "@/lib/aiTracking";

export default function AiMarketingNav({
  landingType,
  brandHref = "/ai",
}: {
  landingType: string;
  brandHref?: string;
}) {
  function onCta(kind: AiLandingCtaKind, href: string) {
    trackAiLandingCta({ landing_type: landingType, cta: kind, href });
  }

  return (
    <header className="ail-nav">
      <div className="ail-nav-inner">
        <Link href={brandHref} className="ail-brand">
          <span className="ail-brand-name">
            آرایه <em>AI</em>
          </span>
          <span className="ail-brand-parent">محصولی از آرایه</span>
        </Link>
        <div className="ail-nav-actions">
          <Link
            href="/ai"
            className="ail-link-login"
            onClick={() => onCta("nav_login", "/ai")}
          >
            ورود
          </Link>
          <Link
            href="/ai"
            className="ar-btn ar-btn-primary ar-btn-sm"
            onClick={() => onCta("primary", "/ai")}
          >
            رایگان امتحان کن
          </Link>
        </div>
      </div>
    </header>
  );
}
