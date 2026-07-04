import type { Metadata } from "next";
import ShareBattlePage from "./ShareBattlePage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  return {
    title: "کدوم مدل بهتر جواب داد؟ | آرایه AI",
    description: "نتیجه یک نبرد واقعی بین دو مدل هوش مصنوعی — تو هم تست کن.",
    openGraph: {
      title: "کدوم مدل بهتر جواب داد؟",
      description: "نبرد مدل‌های AI در آرایه — GPT، Gemini، Claude و…",
      url: `${SITE_URL}/ai/share/${params.slug}`,
      type: "website",
    },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ShareBattlePage slug={params.slug} />;
}
