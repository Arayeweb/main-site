import type { KordianLocale } from "./types";
import { KORDIAN_BASE_PATH } from "./types";

export type KordianPage =
  | "home"
  | "about"
  | "treatments"
  | "articles"
  | "contact";

const PAGE_SEGMENTS: Record<KordianPage, string | null> = {
  home: null,
  about: "about",
  treatments: "treatments",
  articles: "articles",
  contact: "contact",
};

export function kordianPath(
  locale: KordianLocale,
  page: KordianPage = "home",
  slug?: string
): string {
  const segment = PAGE_SEGMENTS[page];
  let path = `${KORDIAN_BASE_PATH}/${locale}`;
  if (segment) path += `/${segment}`;
  if (slug) path += `/${slug}`;
  return path;
}

export function kordianAdminPath(): string {
  return `${KORDIAN_BASE_PATH}/admin-demo`;
}

export function swapKordianLocale(pathname: string, locale: KordianLocale): string {
  const match = pathname.match(new RegExp(`^${KORDIAN_BASE_PATH}/(en|ru)(.*)$`));
  if (match) return `${KORDIAN_BASE_PATH}/${locale}${match[2] || ""}`;
  return kordianPath(locale);
}

export function detectKordianPage(pathname: string): KordianPage {
  if (pathname.includes("/about")) return "about";
  if (pathname.includes("/treatments")) return "treatments";
  if (pathname.includes("/articles")) return "articles";
  if (pathname.includes("/contact")) return "contact";
  return "home";
}
