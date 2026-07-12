import type { FastWebStyleId, FastWebTemplateKey } from "@/lib/fastweb";

export interface FastWebTheme {
  brand: string;
  brandSoft: string;
  brandInk: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  radius: string;
  fontDisplay: string;
  fontBody: string;
  heroOverlay: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mix(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function toHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function buildThemeFromBrand(
  brandColor: string,
  style: FastWebStyleId
): FastWebTheme {
  const rgb = hexToRgb(brandColor) || { r: 15, g: 76, b: 92 };
  const brand = toHex(rgb.r, rgb.g, rgb.b);
  const brandSoft = toHex(
    mix(rgb.r, 255, 0.88),
    mix(rgb.g, 255, 0.88),
    mix(rgb.b, 255, 0.88)
  );
  const brandInk = toHex(
    mix(rgb.r, 0, 0.45),
    mix(rgb.g, 0, 0.45),
    mix(rgb.b, 0, 0.45)
  );

  if (style === "formal") {
    return {
      brand,
      brandSoft,
      brandInk,
      surface: "#F7F6F3",
      surfaceAlt: "#EFEDE7",
      text: "#1A1F24",
      muted: "#5C6670",
      radius: "4px",
      fontDisplay: "var(--font-vazirmatn), Vazirmatn, Tahoma, sans-serif",
      fontBody: "var(--font-vazirmatn), Vazirmatn, Tahoma, sans-serif",
      heroOverlay: `linear-gradient(135deg, ${brandInk}f2 0%, ${brand}cc 55%, ${brand}99 100%)`,
    };
  }

  if (style === "warm") {
    return {
      brand,
      brandSoft,
      brandInk,
      surface: "#FFF8F3",
      surfaceAlt: "#F5EBE3",
      text: "#2A211C",
      muted: "#6E5C52",
      radius: "16px",
      fontDisplay: "var(--font-vazirmatn), Vazirmatn, Tahoma, sans-serif",
      fontBody: "var(--font-vazirmatn), Vazirmatn, Tahoma, sans-serif",
      heroOverlay: `linear-gradient(160deg, ${brand}e6 0%, ${brandInk}d9 100%)`,
    };
  }

  // modern
  return {
    brand,
    brandSoft,
    brandInk,
    surface: "#FAFBFC",
    surfaceAlt: "#F0F3F6",
    text: "#111827",
    muted: "#6B7280",
    radius: "12px",
    fontDisplay: "var(--font-vazirmatn), Vazirmatn, Tahoma, sans-serif",
    fontBody: "var(--font-vazirmatn), Vazirmatn, Tahoma, sans-serif",
    heroOverlay: `linear-gradient(120deg, ${brandInk}f0 0%, ${brand}b3 100%)`,
  };
}

export const TEMPLATE_META: Record<
  FastWebTemplateKey,
  { label: string; description: string }
> = {
  "local-business": {
    label: "کسب‌وکار محلی",
    description: "مناسب خدمات شهری، فروشگاه‌های محلی و کسب‌وکارهای حضوری",
  },
  "clinic-service": {
    label: "خدمات تخصصی",
    description: "مناسب مطب، کلینیک و خدمات حرفه‌ای با حس اعتماد",
  },
  "portfolio-services": {
    label: "نمونه‌کار و خدمات",
    description: "مناسب استودیو، طراح، پیمانکار و نمایش پروژه‌ها",
  },
};
