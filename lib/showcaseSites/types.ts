export type ShowcaseSlug = "shiva-hearing" | "kaveh-iron" | "medisa-studio";

export type ShowcaseLeadSource =
  | "showcase-shiva-hearing"
  | "showcase-kaveh-iron"
  | "showcase-medisa-studio";

export interface ShowcasePortfolioEntry {
  slug: ShowcaseSlug;
  title: string;
  industry: string;
  description: string;
  thumbnail: string;
  desktopPreview: string;
  mobilePreview: string;
  services: string[];
  projectType: string;
  route: string;
  showcaseStatus: "conceptual";
  leadSource: ShowcaseLeadSource;
}
