import {
  Building2,
  Dumbbell,
  GraduationCap,
  Home,
  Scale,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Maps the `icon` string on FastWebCategoryMeta to an actual Lucide component. */
export const FASTWEB_CATEGORY_ICONS: Record<string, LucideIcon> = {
  Wrench,
  Stethoscope,
  ShoppingBag,
  UtensilsCrossed,
  Building2,
  Sparkles,
  Dumbbell,
  Scale,
  Home,
  GraduationCap,
};

export function getFastWebCategoryIcon(icon: string): LucideIcon {
  return FASTWEB_CATEGORY_ICONS[icon] || Wrench;
}
