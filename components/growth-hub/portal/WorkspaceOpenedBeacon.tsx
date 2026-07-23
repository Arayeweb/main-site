"use client";

import { useEffect } from "react";
import { recordWorkspaceOpenedAction } from "@/lib/growth-hub/actions/portal";

/**
 * Fires workspace_opened once per browser session per workspace (debounced via
 * sessionStorage, ~matches the 30m debounce intent for MVP). Renders nothing.
 */
export function WorkspaceOpenedBeacon({
  workspaceId,
  path,
}: {
  workspaceId: string;
  path: string;
}) {
  useEffect(() => {
    const key = `gh_opened_${workspaceId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, String(Date.now()));
    } catch {
      // sessionStorage unavailable — still record once per mount.
    }
    void recordWorkspaceOpenedAction(workspaceId, path);
  }, [workspaceId, path]);

  return null;
}
