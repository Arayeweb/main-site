import { pushGtmEvent } from "@/lib/gtm";

export type FreeToolName = "bizcard" | "qr" | "shortener";
export type FreeToolAction =
  | "start"
  | "complete"
  | "download"
  | "copy"
  | "next_step";

export function trackFreeToolEvent(
  tool: FreeToolName,
  action: FreeToolAction,
  details: Record<string, string | number | boolean | undefined> = {},
) {
  pushGtmEvent("free_tool_event", {
    tool,
    action,
    funnel_stage:
      action === "start"
        ? "use"
        : action === "next_step"
          ? "next_step"
          : "complete",
    ...details,
  });
}
