"use client";

import { useEffect } from "react";
import { recordServiceViewedAction } from "@/lib/growth-hub/actions/servicePortal";

export function ServiceViewedBeacon({
  serviceId,
  workspaceId,
}: {
  serviceId: string;
  workspaceId: string;
}) {
  useEffect(() => {
    const key = `gh_service_viewed:${serviceId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // ignore storage failures
    }
    void recordServiceViewedAction(serviceId, workspaceId);
  }, [serviceId, workspaceId]);

  return null;
}
