import { SITE_URL } from "@/lib/siteUrl";
import type { Metadata } from "next";
import { getKordianMessages } from "./i18n";
import { kordianPath } from "./routes";
import type { KordianLocale } from "./types";
import { KORDIAN_BASE_PATH } from "./types";

type MetaPage = "home" | "about" | "treatments" | "articles" | "contact";

const META_KEYS: Record<MetaPage, "homeTitle" | "aboutTitle" | "treatmentsTitle" | "articlesTitle" | "contactTitle"> = {
  home: "homeTitle",
  about: "aboutTitle",
  treatments: "treatmentsTitle",
  articles: "articlesTitle",
  contact: "contactTitle",
};

const META_DESC_KEYS: Record<MetaPage, "homeDescription" | "aboutDescription" | "treatmentsDescription" | "articlesDescription" | "contactDescription"> = {
  home: "homeDescription",
  about: "aboutDescription",
  treatments: "treatmentsDescription",
  articles: "articlesDescription",
  contact: "contactDescription",
};

export function buildKordianMetadata(
  locale: KordianLocale,
  page: MetaPage,
  slug?: string,
  articleTitle?: string
): Metadata {
  const messages = getKordianMessages(locale);
  const titleKey = META_KEYS[page];
  const descKey = META_DESC_KEYS[page];
  const title = articleTitle ?? messages.meta[titleKey];
  const description = messages.meta[descKey];
  const path = slug ? kordianPath(locale, "articles", slug) : kordianPath(locale, page === "home" ? "home" : page);
  const enPath = slug ? kordianPath("en", "articles", slug) : kordianPath("en", page === "home" ? "home" : page);
  const ruPath = slug ? kordianPath("ru", "articles", slug) : kordianPath("ru", page === "home" ? "home" : page);

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: {
        en: `${SITE_URL}${enPath}`,
        ru: `${SITE_URL}${ruPath}`,
        "x-default": `${SITE_URL}${kordianPath("en", page === "home" ? "home" : page)}`,
      },
    },
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      locale: locale === "en" ? "en_US" : "ru_RU",
      alternateLocale: locale === "en" ? ["ru_RU"] : ["en_US"],
      type: "website",
    },
  };
}

export function buildKordianAdminMetadata(): Metadata {
  return {
    title: "CMS Preview — Dr. Kordian",
    description: "Demonstration content management dashboard for Dr. Kordian clinic website preview.",
    robots: { index: false, follow: false },
    alternates: { canonical: `${SITE_URL}${KORDIAN_BASE_PATH}/admin-demo` },
  };
}
