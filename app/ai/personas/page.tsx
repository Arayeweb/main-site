import type { Metadata } from "next";
import PersonasGalleryPage from "./PersonasGalleryPage";

export const metadata: Metadata = {
  title: "شخصیت‌های مشهور | آرایه AI",
  description:
    "با ایلان ماسک، رونالدو، اینشتین و ۹ شخصیت دیگر گفتگو کن — شبیه‌سازی AI به فارسی، بدون VPN.",
};

export default function PersonasPage() {
  return <PersonasGalleryPage />;
}
