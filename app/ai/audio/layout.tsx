import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: "استودیو صوت | آرایه AI",
  description: "استودیو صوت با هوش مصنوعی آرایه — محیط اپلیکیشن.",
};

export default function AudioStudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
