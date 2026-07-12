import type {
  AcquisitionChannel,
  ConfirmationBranch,
  CustomerScope,
  PrimaryBusinessProblem,
  WebsiteBriefInput,
} from "./types";
import { LOCAL_SCOPES } from "./constants";

/** تعیین شاخه سؤال تأییدی — فقط یک شاخه در هر ثبت */
export function resolveConfirmationBranch(input: Pick<
  WebsiteBriefInput,
  "primary_business_problem" | "customer_scope" | "acquisition_channels"
>): ConfirmationBranch | null {
  const problem = input.primary_business_problem;

  if (
    problem === "not_visible_in_search_and_maps" &&
    LOCAL_SCOPES.includes(input.customer_scope as CustomerScope)
  ) {
    return "maps_presence";
  }

  if (
    problem === "low_lead_volume" ||
    problem === "dependent_on_instagram_and_referrals"
  ) {
    return "google_leads";
  }

  if (problem === "poor_advertising_conversion") {
    return "advertising";
  }

  if (problem === "repetitive_questions" || problem === "no_after_hours_response") {
    return "customer_guidance";
  }

  if (problem === "scattered_leads" || problem === "forgotten_followups") {
    return "lead_followup";
  }

  if (input.acquisition_channels.includes("online_advertising" as AcquisitionChannel)) {
    return "advertising";
  }

  return null;
}

export function confirmationFieldForBranch(
  branch: ConfirmationBranch | null
): keyof WebsiteBriefInput | null {
  switch (branch) {
    case "maps_presence":
      return "google_maps_status";
    case "google_leads":
      return "google_lead_status";
    case "advertising":
      return "advertising_status";
    case "customer_guidance":
      return "customer_guidance_need";
    case "lead_followup":
      return "lead_followup_status";
    default:
      return null;
  }
}

export function isProblemBasedBranch(problem: PrimaryBusinessProblem, branch: ConfirmationBranch): boolean {
  switch (branch) {
    case "maps_presence":
      return problem === "not_visible_in_search_and_maps";
    case "google_leads":
      return problem === "low_lead_volume" || problem === "dependent_on_instagram_and_referrals";
    case "advertising":
      return problem === "poor_advertising_conversion";
    case "customer_guidance":
      return problem === "repetitive_questions" || problem === "no_after_hours_response";
    case "lead_followup":
      return problem === "scattered_leads" || problem === "forgotten_followups";
    default:
      return false;
  }
}
