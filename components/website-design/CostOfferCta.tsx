"use client";

import Link from "next/link";
import { trackWebsiteDesignOfferClick } from "@/lib/analytics/websiteDesignTracking";
import type { WebsitePricingPath } from "@/lib/websitePricing";

type Props = {
  href: string;
  label: string;
  offerId: string;
  path: WebsitePricingPath;
  className?: string;
};

export default function CostOfferCta({ href, label, offerId, path, className }: Props) {
  return (
    <Link
      href={href}
      className={className ?? "btn-primary mt-6 inline-flex w-full justify-center"}
      onClick={() =>
        trackWebsiteDesignOfferClick({
          offer: path === "fastweb" ? "fastweb" : "custom",
          offer_id: offerId,
          location: "cost_offer_card",
        })
      }
    >
      {label}
    </Link>
  );
}
