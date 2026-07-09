import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "قیمت و پکیج‌ها | آرایه AI",
  description:
    "پکیج‌های آرایه AI — چت با چند مدل، تولید تصویر و ویدیو. پرداخت تومان، بدون VPN و کارت خارجی.",
  alternates: { canonical: "/ai/pricing" },
  openGraph: {
    title: "قیمت آرایه AI — پکیج‌های چت و تولید محتوا",
    description: "پلن‌های رایگان و پولی برای استفاده از ChatGPT، Claude، Gemini و ابزارهای تولید محتوا.",
    url: "/ai/pricing",
    locale: "fa_IR",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
