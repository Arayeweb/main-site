import type { Metadata } from "next";
import PersonasGalleryPage from "./PersonasGalleryPage";

export const metadata: Metadata = {
  title: "شخصیت‌های هوشمند | آرایه AI",
  description:
    "با ذهن شبیه‌سازی‌شده چهره‌های بزرگ گفتگو کن — برای یادگیری، ایده‌گیری و تصمیم‌سازی به فارسی، بدون VPN.",
  alternates: { canonical: "/ai/personas" },
  openGraph: {
    title: "شخصیت‌های هوشمند | آرایه AI",
    description: "گفتگو با شخصیت‌های شبیه‌سازی‌شده برای یادگیری و ایده‌گیری به فارسی.",
    url: "/ai/personas",
    locale: "fa_IR",
  },
};

export default function PersonasPage() {
  return <PersonasGalleryPage />;
}
