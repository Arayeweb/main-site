import type { ComponentType } from "react";
import PediatricSite from "@/components/showdemoto/pediatric/PediatricSite";
import type { ShowDemoEntry, ShowDemoSlug } from "./types";

const entries: ShowDemoEntry[] = [
  {
    slug: "dr-ahmadi-pediatric",
    title: "مطب کودکان نوین — دکتر نازنین احمدی",
    description:
      "سایت نمونه برای متخصص اطفال و کودکان با چت‌بات نوبت‌دهی — طراحی روشن و دوستانه برای ارائه به مشتری.",
    leadSource: "showdemoto-dr-ahmadi-pediatric",
    page: "/showdemoto/dr-ahmadi-pediatric",
    Component: PediatricSite,
  },
];

export function getShowDemoEntry(slug: string): ShowDemoEntry | undefined {
  return entries.find((entry) => entry.slug === slug);
}

export function getAllShowDemoSlugs(): ShowDemoSlug[] {
  return entries.map((entry) => entry.slug);
}

export function getShowDemoComponent(slug: string): ComponentType | undefined {
  return getShowDemoEntry(slug)?.Component;
}
