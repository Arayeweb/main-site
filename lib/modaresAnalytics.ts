import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import {
  modaresPlanForVariant,
  type ModaresPlan,
} from "@/lib/modaresLead";
import type { ModaresVariant } from "@/lib/modaresData";

export type ModaresAnalyticsPayload = {
  variant?: ModaresVariant | string;
  utm_content?: string;
  teaching_field?: string;
  selected_plan?: ModaresPlan | string;
  form_location?: string;
  demo_tab?: string;
  error?: string;
  auto_open?: boolean;
  [key: string]: string | boolean | undefined;
};

export function trackModaresEvent(
  event: string,
  payload: ModaresAnalyticsPayload = {},
) {
  const utm = typeof window !== "undefined" ? getUtmParams() : {};
  const base = {
    page: "modares",
    utm_content: utm.utm_content,
    ...payload,
  };
  pushGtmEvent(event, base);
  if (event === "teachers_lead_submit") {
    pushGtmEvent("generate_lead", {
      ...base,
      source: "modares_form",
    });
  }
}

export function modaresAnalyticsBase(variant: ModaresVariant): ModaresAnalyticsPayload {
  return {
    variant: variant === "default" ? "default" : variant,
    selected_plan: modaresPlanForVariant(variant),
    utm_content: typeof window !== "undefined" ? getUtmParams().utm_content : undefined,
  };
}
