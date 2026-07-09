import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/lib/sitemapRoutes";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries();
}
