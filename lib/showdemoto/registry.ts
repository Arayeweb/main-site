import type { ComponentType } from "react";
import SalamatFardaSite from "@/components/showdemoto/salamat-farda/SalamatFardaSite";
import KordianDemoEntry from "@/components/showdemoto/dr-kordian/KordianDemoEntry";
import PediatricSite from "@/components/showdemoto/pediatric/PediatricSite";
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
  {
    slug: "dr-kordian",
    title: "Dr. Kordian — Ophthalmologist",
    description:
      "Premium bilingual medical website (EN/RU) with CMS preview for international eye-care patients.",
    leadSource: "showdemoto-dr-kordian",
    page: "/showdemoto/dr-kordian/en",
    Component: KordianDemoEntry,
  },
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
