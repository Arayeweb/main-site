"use client";

import { useEffect } from "react";
import { modaresAnalyticsBase, trackModaresEvent } from "@/lib/modaresAnalytics";
import type { ModaresVariant } from "@/lib/modaresData";

type ModaresPageTrackerProps = {
  variant: ModaresVariant;
};

export default function ModaresPageTracker({ variant }: ModaresPageTrackerProps) {
  useEffect(() => {
    trackModaresEvent("teachers_landing_view", modaresAnalyticsBase(variant));
  }, [variant]);

  return null;
}
