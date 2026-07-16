"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordPageview } from "@/lib/pageviewTracking";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";

export default function DoctorsPageAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    recordPageview(pathname || "/doctors");
    trackDoctorsEvent("doctors_page_view");
  }, [pathname]);

  return null;
}
