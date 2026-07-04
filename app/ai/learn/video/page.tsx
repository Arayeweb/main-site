import type { Metadata } from "next";
import FeatureLearnLayout from "@/components/ai/FeatureLearnLayout";

export const metadata: Metadata = {
  title: "ساخت ویدیو AI | آرایه AI — Seedance، Kling، Sora",
  description:
    "ویدیو کوتاه از متن فارسی — Seedance، Kling و مدل‌های premium. اعلان وضعیت در تلگرام.",
  alternates: { canonical: "/ai/learn/video" },
  openGraph: {
    title: "ساخت ویدیو با هوش مصنوعی — آرایه AI",
    url: "/ai/learn/video",
    locale: "fa_IR",
  },
};

const FAQ = [
  {
    q: "ساخت ویدیو چقدر طول می‌کشد؟",
    a: "بسته به مدل از چند ثانیه تا چند دقیقه — وضعیت «در صف / پردازش / آماده» در UI نمایش داده می‌شود.",
  },
  {
    q: "آیا می‌توانم ویدیو را از عکس بسازم؟",
    a: "بله — در استودیو ویدیو می‌توانی یک فریم مرجع آپلود کنی.",
  },
];

export default function VideoLearnPage() {
  return (
    <FeatureLearnLayout
      title="ساخت ویدیو با AI"
      subtitle="توضیح فارسی → ویدیو کوتاه — بدون VPN، پرداخت تومان."
      ctaHref="/ai/video"
      ctaLabel="رفتن به استودیو ویدیو"
      faq={FAQ}
    >
      <ul className="ar-learn-list">
        <li>poll هوشمند با backoff برای perceived speed</li>
        <li>resume و dismiss job</li>
        <li>≈ ۱ ویدیو کوتاه در هر ۱۰ کردیت (پکیج استارتر)</li>
      </ul>
    </FeatureLearnLayout>
  );
}
