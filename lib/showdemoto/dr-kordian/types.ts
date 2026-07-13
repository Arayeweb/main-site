export type KordianLocale = "en" | "ru";

export type LocalizedString = Record<KordianLocale, string>;

export interface KordianService {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  icon: "exam" | "cataract" | "retina" | "vision";
}

export interface KordianJourneyStep {
  step: number;
  title: LocalizedString;
  description: LocalizedString;
}

export interface KordianWhyChooseItem {
  title: LocalizedString;
  description: LocalizedString;
}

export const KORDIAN_LOCALES: KordianLocale[] = ["en", "ru"];

export const KORDIAN_BASE_PATH = "/showdemoto/dr-kordian";

export function isKordianLocale(value: string): value is KordianLocale {
  return value === "en" || value === "ru";
}
