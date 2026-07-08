import type { Metadata } from "next";
import FeatureLearnLayout from "@/components/ai/FeatureLearnLayout";

export const metadata: Metadata = {
  title: "جایگزین ChatGPT فارسی | آرایه AI — بدون VPN",
  description:
    "چت فارسی با GPT، Claude، Gemini و Grok — پرداخت تومان، بدون VPN. جایگزین ChatGPT برای کاربران ایرانی.",
  alternates: { canonical: "/ai/learn/chatgpt" },
  openGraph: {
    title: "جایگزین ChatGPT فارسی — آرایه AI",
    description: "چند مدل AI در یک حساب — فارسی، تومان، بدون VPN.",
    url: "/ai/learn/chatgpt",
    locale: "fa_IR",
  },
};

const FAQ = [
  {
    q: "آیا آرایه AI جایگزین ChatGPT است؟",
    a: "بله — چند مدل شامل GPT، Claude و Gemini را با پرداخت تومان و بدون VPN در یک رابط فارسی ارائه می‌دهد.",
  },
  {
    q: "آیا برای شروع باید VPN داشته باشم؟",
    a: "خیر — سرویس از ایران بدون VPN در دسترس است.",
  },
];

export default function ChatGptLearnPage() {
  return (
    <FeatureLearnLayout
      title="جایگزین ChatGPT برای فارسی‌زبان‌ها"
      subtitle="چت، مقایسه مدل‌ها، و ساخت محتوا — همه با پرداخت تومان و بدون کارت خارجی."
      ctaHref="/ai"
      ctaLabel="شروع رایگان"
      faq={FAQ}
    >
      <ul className="ar-learn-list">
        <li>۵ پیام چت رایگان برای مهمان — بدون ثبت‌نام</li>
        <li>نبرد دو مدل + لیدربورد — مزیتی که ChatGPT ندارد</li>
        <li>گفتگو با شخصیت‌های هوشمند — شبیه‌سازی AI به فارسی</li>
        <li>استودیو عکس، ویدیو، صوت و موزیک در یک حساب</li>
      </ul>
    </FeatureLearnLayout>
  );
}
