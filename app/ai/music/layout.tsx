import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: "استودیو موزیک | آرایه AI",
  description: "ساخت موزیک با هوش مصنوعی آرایه — محیط اپلیکیشن.",
};

export default function MusicStudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
