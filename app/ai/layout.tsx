import type { Metadata, Viewport } from "next";
import "./ai.css";
import ArenaLayoutClient from "./ArenaLayoutClient";
import ArenaRscChrome from "./ArenaRscChrome";
import AiCampaignTracking from "@/components/ai/AiCampaignTracking";
import AiPostHogProvider from "@/components/analytics/AiPostHogProvider";

export const metadata: Metadata = {
  title: "آرایه AI | یک اکانت برای چند AI — فارسی و بدون VPN",
  description:
    "ChatGPT، Claude، Gemini و DeepSeek در یک حساب — بدون VPN و کارت خارجی. چت، مقایسه مدل‌ها و تولید محتوا.",
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
  themeColor: "#F6F7F9",
  width: "device-width",
  initialScale: 1,
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  return (
    <AiPostHogProvider>
      <div className="ar-root">
        <ArenaRscChrome />
        <AiCampaignTracking />
        <ArenaLayoutClient>{children}</ArenaLayoutClient>
      </div>
    </AiPostHogProvider>
  );
}
