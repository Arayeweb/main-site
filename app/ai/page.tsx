import type { Metadata } from "next";
import ArenaHomePage from "./ArenaHomePage";
import AiLandingSeoContent from "@/components/ai/AiLandingSeoContent";
import { canonicalUrl } from "@/lib/siteUrl";

const AI_TITLE = "هوش مصنوعی آرایه | مقایسه ChatGPT، Claude و Gemini";
const AI_DESCRIPTION =
  "با هوش مصنوعی آرایه از ChatGPT، Claude، Gemini، Grok و DeepSeek هم‌زمان استفاده کنید، پاسخ‌ها را مقایسه کنید و با پرداخت تومانی و بدون VPN شروع کنید.";

export const metadata: Metadata = {
  title: { absolute: AI_TITLE },
  description: AI_DESCRIPTION,
  alternates: { canonical: canonicalUrl("/ai") },
  openGraph: {
    title: AI_TITLE,
    description: AI_DESCRIPTION,
    url: canonicalUrl("/ai"),
    siteName: "آرایه",
    locale: "fa_IR",
  },
};

export default function AIPage() {
  return (
    <ArenaHomePage>
      <AiLandingSeoContent />
    </ArenaHomePage>
  );
}
