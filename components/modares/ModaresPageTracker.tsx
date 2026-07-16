"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordPageview } from "@/lib/pageviewTracking";
import { modaresAnalyticsBase, trackModaresEvent } from "@/lib/modaresAnalytics";
import type { ModaresVariant } from "@/lib/modaresData";

type ModaresPageTrackerProps = {
  variant: ModaresVariant;
};

export default function ModaresPageTracker({ variant }: ModaresPageTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    recordPageview(pathname || "/modares");
    trackModaresEvent("teachers_landing_view", modaresAnalyticsBase(variant));
  }, [variant, pathname]);

  return null;
}
