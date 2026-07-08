import type { Metadata } from "next";
import PersonasGalleryPage from "./PersonasGalleryPage";

export const metadata: Metadata = {
  title: "شخصیت‌های هوشمند | آرایه AI",
  description:
    "با ذهن شبیه‌سازی‌شده چهره‌های بزرگ گفتگو کن — برای یادگیری، ایده‌گیری و تصمیم‌سازی به فارسی، بدون VPN.",
};

export default function PersonasPage() {
  return <PersonasGalleryPage />;
}
