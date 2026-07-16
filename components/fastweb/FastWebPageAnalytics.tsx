"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pushGtmEvent } from "@/lib/gtm";
import { recordPageview } from "@/lib/pageviewTracking";
import { getUtmParams } from "@/lib/utm";

export default function FastWebPageAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    const page = pathname || "/fastweb";
    recordPageview(page);
    const utm = getUtmParams();
    pushGtmEvent("fastweb_page_view", { page, ...utm });
  }, [pathname]);

  return null;
}
