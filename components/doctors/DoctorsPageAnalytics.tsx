"use client";

import { useEffect } from "react";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";

export default function DoctorsPageAnalytics() {
  useEffect(() => {
    trackDoctorsEvent("doctors_page_view");
  }, []);

  return null;
}
