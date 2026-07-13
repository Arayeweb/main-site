import type { FastWebBrief, FastWebPackageKey } from "@/lib/fastweb";
import { suggestedSectionsForGoal } from "@/lib/fastweb";

export const FASTWEB_DRAFT_KEY = "araaye_fastweb_draft_v1";
export const FASTWEB_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface FastWebWizardDraft {
  version: 1;
  savedAt: number;
  step: number;
  orderId?: string;
  accessToken?: string;
  packageKey?: FastWebPackageKey;
  brief: FastWebBrief;
}

export function createEmptyBrief(): FastWebBrief {
  return {
    goal: undefined,
    businessName: "",
    industry: "",
    city: "",
    shortDescription: "",
    offerings: "",
    mainAdvantage: "",
    audience: "",
    audiencePresets: [],
    sections: suggestedSectionsForGoal(undefined),
    style: "modern",
    brandColor: "#0F4C5C",
    logoUrl: "",
    imageNotes: "",
    favoriteSites: "",
    attachmentUrl: "",
    attachmentName: "",
    contacts: {
      phone: "",
      whatsapp: "",
      instagram: "",
      address: "",
      hours: "",
      locationUrl: "",
      email: "",
    },
    slugPreference: "",
    domainChoice: "subdomain",
    customDomain: "",
    legalName: "",
    nationalId: "",
    companyRegistrationNumber: "",
    postalCode: "",
    enamadUrl: "",
    samandehiUrl: "",
    socialLinksRaw: "",
  };
}

export function loadFastWebDraft(): FastWebWizardDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FASTWEB_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FastWebWizardDraft;
    if (parsed.version !== 1 || !parsed.savedAt) return null;
    if (Date.now() - parsed.savedAt > FASTWEB_DRAFT_TTL_MS) {
      localStorage.removeItem(FASTWEB_DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveFastWebDraft(draft: FastWebWizardDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      FASTWEB_DRAFT_KEY,
      JSON.stringify({ ...draft, savedAt: Date.now(), version: 1 })
    );
  } catch {
    // ignore quota
  }
}

export function clearFastWebDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(FASTWEB_DRAFT_KEY);
  } catch {
    // ignore
  }
}
