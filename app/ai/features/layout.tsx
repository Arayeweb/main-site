import type { Metadata } from "next";
import "./features.css";
import { canonicalUrl } from "@/lib/siteUrl";

const FEATURES_TITLE = "امکانات آرایه AI | چت، مقایسه، استودیو و نبرد مدل‌ها";
const FEATURES_DESCRIPTION =
  "امکانات هوش مصنوعی آرایه: چت فارسی، مقایسه مدل‌ها، استودیو تصویر و کد، نبرد مدل‌ها — بدون VPN و با پرداخت تومان.";

export const metadata: Metadata = {
  title: { absolute: FEATURES_TITLE },
  description: FEATURES_DESCRIPTION,
  alternates: { canonical: canonicalUrl("/ai/features") },
  openGraph: {
    title: FEATURES_TITLE,
    description: FEATURES_DESCRIPTION,
    url: canonicalUrl("/ai/features"),
    siteName: "آرایه",
    locale: "fa_IR",
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return <div className="feat-root">{children}</div>;
}
