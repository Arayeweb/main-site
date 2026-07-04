import type { Metadata, Viewport } from "next";
import "./ai.css";
import ArenaLayoutClient from "./ArenaLayoutClient";
import ArenaRscChrome from "./ArenaRscChrome";
import AiCampaignTracking from "@/components/ai/AiCampaignTracking";

export const metadata: Metadata = {
  title: "آرایه AI | دسترسی به ۵ مدل هوش مصنوعی با پرداخت تومان",
  description:
    "GPT، Claude، Gemini، Grok و DeepSeek در یک جا — بدون VPN و کارت خارجی. گفتگو کن، مدل عوض کن، یا دو مدل را مقایسه کن.",
  manifest: "/ai.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "آرایه AI",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/logo-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/assets/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F5EF",
  width: "device-width",
  initialScale: 1,
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ar-root">
      <ArenaRscChrome />
      <AiCampaignTracking />
      <ArenaLayoutClient>{children}</ArenaLayoutClient>
    </div>
  );
}
