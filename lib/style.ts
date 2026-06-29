import type React from "react";

export function cssTextToReactStyle(cssText: string): React.CSSProperties {
  return cssText
    .split(";")
    .map((rule) => rule.trim())
    .filter(Boolean)
    .reduce((acc, rule) => {
      const [rawKey, ...rawValueParts] = rule.split(":");
      if (!rawKey || rawValueParts.length === 0) return acc;

      const key = rawKey.trim();
      const isCustomProp = key.startsWith("--");
      const normalizedKey = isCustomProp
        ? key
        : key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

      const value = rawValueParts.join(":").trim();

      if (normalizedKey && value) {
        (acc as Record<string, string>)[normalizedKey] = value;
      }

      return acc;
    }, {} as React.CSSProperties);
}

export function normalizeReactStyle(input: unknown): React.CSSProperties | undefined {
  if (!input) return undefined;

  if (typeof input === "object" && !Array.isArray(input)) {
    return input as React.CSSProperties;
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return undefined;

    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as React.CSSProperties;
      }
    } catch {}

    return cssTextToReactStyle(trimmed);
  }

  return undefined;
}

export function sanitizeBlockProps<T extends Record<string, unknown>>(
  props: T | undefined | null
): Omit<T, "style"> & { style?: React.CSSProperties } {
  const safe = { ...props } as Omit<T, "style"> & { style?: React.CSSProperties };
  safe.style = normalizeReactStyle(props?.style);
  return safe;
}
