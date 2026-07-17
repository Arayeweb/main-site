import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: "استودیو کد | آرایه AI",
  description: "استودیو کدنویسی با هوش مصنوعی آرایه — محیط اپلیکیشن.",
};

export default function CodeStudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
