/**
 * Cross-tool and hub internal linking helpers for Araaye free tools.
 */

import {
  getHubPath,
  getPublishedToolPages,
  getToolPage,
  type ToolHub,
} from "./toolRegistry";

export function getToolSiblingLinks(hub: ToolHub, slug: string, limit = 6) {
  const entry = getToolPage(hub, slug);
  if (!entry) return [];

  const fromRelated = entry.relatedSlugs
    .map((s) => getToolPage(hub, s))
    .filter((p): p is NonNullable<typeof p> => !!p && p.status === "published")
    .map((p) => ({
      href: `${getHubPath(hub)}/${p.slug}`,
      keyword: p.primaryKeyword,
      label: p.label,
    }));

  if (fromRelated.length >= limit) return fromRelated.slice(0, limit);

  const extras = getPublishedToolPages(hub)
    .filter((p) => p.slug !== slug && !fromRelated.some((r) => r.href.endsWith(`/${p.slug}`)))
    .slice(0, limit - fromRelated.length)
    .map((p) => ({
      href: `${getHubPath(hub)}/${p.slug}`,
      keyword: p.primaryKeyword,
      label: p.label,
    }));

  return [...fromRelated, ...extras];
}

export function getToolCrossLinks(hub: ToolHub, slug: string) {
  const entry = getToolPage(hub, slug);
  if (!entry?.crossToolLinks) return [];
  return entry.crossToolLinks.map((c) => ({
    href: `/${c.hub}/${c.slug}`,
    anchor: c.anchor,
  }));
}
