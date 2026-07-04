import type { Metadata } from "next";
import FeatureLearnLayout from "@/components/ai/FeatureLearnLayout";

export const metadata: Metadata = {
  title: "ساخت عکس AI فارسی | آرایه AI",
  description:
    "تولید تصویر با Gemini Image و GPT Image — توضیح فارسی بنویس، عکس بگیر. پرداخت تومان.",
  alternates: { canonical: "/ai/learn/image" },
  openGraph: {
    title: "ساخت عکس با هوش مصنوعی — آرایه AI",
    url: "/ai/learn/image",
    locale: "fa_IR",
  },
};

const FAQ = [
  {
    q: "چند کردیت برای یک عکس لازم است؟",
    a: "حدود ۲ تا ۵ کردیت بسته به مدل — معادل «≈ ۲ تصویر» در پکیج استارتر.",
  },
  {
    q: "آیا می‌توانم از عکس مرجع استفاده کنم؟",
    a: "بله — در استودیو تصویر می‌توانی یک تصویر مرجع پیوست کنی.",
  },
];

export default function ImageLearnPage() {
  return (
    <FeatureLearnLayout
      title="ساخت عکس با AI — فارسی و سریع"
      subtitle="Gemini 3.1 Image و GPT Image 2 — توضیح بده، تصویر بگیر، دانلود کن."
      ctaHref="/ai/image"
      ctaLabel="رفتن به استودیو تصویر"
      faq={FAQ}
    >
      <ul className="ar-learn-list">
        <li>مدل سریع پیش‌فرض برای perceived speed</li>
        <li>گالری session + تاریخچه در sidebar</li>
        <li>مراحل واضح: در صف → پردازش → آماده</li>
      </ul>
    </FeatureLearnLayout>
  );
}
