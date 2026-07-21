import type { ComponentType } from "react";

export type ShowDemoSlug = "dr-ahmadi-pediatric";

export type ShowDemoLeadSource = `showdemoto-${ShowDemoSlug}`;

export interface ShowDemoEntry {
  slug: ShowDemoSlug;
  title: string;
  description: string;
  leadSource: ShowDemoLeadSource;
  page: string;
  Component: ComponentType;
}
