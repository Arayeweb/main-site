import type { Metadata } from "next";
import "./features.css";

export const metadata: Metadata = {
  title: "امکانات آرایه AI | یک سؤال، چند نگاه",
  description:
    "از چند هوش مصنوعی بپرسید، پاسخ‌ها را کنار هم ببینید و به نتیجه بهتر برسید. فارسی، بدون VPN، پرداخت تومان.",
  alternates: { canonical: "/ai/features" },
  openGraph: {
    title: "امکانات آرایه AI — یک سؤال، چند نگاه",
    description:
      "مقایسه پاسخ GPT، Claude و Gemini در یک پنل فارسی. برای تولید محتوا، کدنویسی و کار روزمره.",
    url: "/ai/features",
    locale: "fa_IR",
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return <div className="feat-root">{children}</div>;
}
