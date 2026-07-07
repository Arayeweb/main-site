import type { Metadata } from "next";
import "./features.css";
import "./cinema.css";

export const metadata: Metadata = {
  title: "آرایه AI | یک سؤال؛ چند AI؛ یک خروجی بهتر",
  description:
    "پنل هوش مصنوعی فارسی — پرسیدن، مقایسه چند مدل، تولید محتوا و کدنویسی. بدون VPN، پرداخت تومان.",
  alternates: { canonical: "/ai/features" },
  openGraph: {
    title: "آرایه AI — یک سؤال؛ چند AI؛ یک خروجی بهتر",
    description: "پنل فارسی برای مقایسه پاسخ چند مدل هوش مصنوعی و کار واقعی.",
    url: "/ai/features",
    locale: "fa_IR",
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return <div className="feat-root">{children}</div>;
}
