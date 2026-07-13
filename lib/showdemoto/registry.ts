import type { ComponentType } from "react";
import SalamatFardaSite from "@/components/showdemoto/salamat-farda/SalamatFardaSite";
import type { ShowDemoEntry, ShowDemoSlug } from "./types";

const entries: ShowDemoEntry[] = [
  {
    slug: "salamat-farda-eye",
    title: "مرکز تخصصی چشم بیمارستان سلامت فردا",
    description:
      "جراحی پلک، زیبایی چشم و خدمات تخصصی چشم‌پزشکی — نمونه طراحی برای ارائه به مشتری.",
    leadSource: "showdemoto-salamat-farda-eye",
    page: "/showdemoto/salamat-farda-eye",
    Component: SalamatFardaSite,
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
