import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: "استودیو تصویر | آرایه AI",
  description: "ساخت تصویر با هوش مصنوعی آرایه — محیط اپلیکیشن.",
};

export default function ImageStudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
