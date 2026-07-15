export const MODARES_SHORT_ROUTES = {
  a: {
    variant: "students",
    utm_source: "yektanet",
    utm_medium: "sms",
    utm_campaign: "teachers_tehran",
    utm_content: "a",
  },
  b: {
    variant: "courses",
    utm_source: "yektanet",
    utm_medium: "sms",
    utm_campaign: "teachers_tehran",
    utm_content: "b",
  },
} as const;

export type ModaresShortSlug = keyof typeof MODARES_SHORT_ROUTES;

export function buildModaresRedirectUrl(
  slug: ModaresShortSlug,
  incomingSearchParams: URLSearchParams,
  origin = "http://localhost:3000",
): URL {
  const url = new URL("/modares", origin);
  const config = MODARES_SHORT_ROUTES[slug];

  url.searchParams.set("variant", config.variant);
  url.searchParams.set("utm_source", config.utm_source);
  url.searchParams.set("utm_medium", config.utm_medium);
  url.searchParams.set("utm_campaign", config.utm_campaign);
  url.searchParams.set("utm_content", config.utm_content);

  for (const [key, value] of incomingSearchParams) {
    if (!url.searchParams.has(key)) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}
