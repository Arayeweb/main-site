"use client";

import Navbar from "@/components/Navbar";
import { openWebsiteDesignLead } from "@/components/website-design/website-design-hero-lead-bar";

export default function WebsiteDesignNavbar() {
  return (
    <Navbar
      ctaLabel="گفت‌وگو درباره سایت"
      onCtaClick={(event) => {
        event.preventDefault();
        openWebsiteDesignLead("navbar");
      }}
    />
  );
}
