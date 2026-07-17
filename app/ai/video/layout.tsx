import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: "استودیو ویدیو | آرایه AI",
  description: "ساخت ویدیو با هوش مصنوعی آرایه — محیط اپلیکیشن.",
};

export default function VideoStudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
