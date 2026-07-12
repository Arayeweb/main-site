import type { Metadata } from "next";
import "./better-than-one-ai.css";

export const metadata: Metadata = {
  title: "بهتر از یک AI | Araaye AI — از ChatGPT به نتیجه",
  description:
    "کاربر دنبال مدل بهتر نیست؛ دنبال نتیجه بهتر است. Araaye AI چند مدل را کنار هم می‌گذارد تا بهترین خروجی را بسازی.",
  alternates: { canonical: "/ai/better-than-one-ai" },
  openGraph: {
    title: "Araaye AI — بهتر از یک AI",
    description:
      "یک AI جواب می‌دهد. Araaye AI بهترین جواب را پیدا می‌کند.",
    url: "/ai/better-than-one-ai",
    locale: "fa_IR",
  },
};

export default function BetterThanOneAiLayout({ children }: { children: React.ReactNode }) {
  return <div className="bto-root">{children}</div>;
}
