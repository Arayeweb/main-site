import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./ai.css";
import ArenaLayoutClient from "./ArenaLayoutClient";
import ArenaRscChrome from "./ArenaRscChrome";
import PWABootSplash from "./PWABootSplash";
import PWARegister from "./PWARegister";
import PWASplashMarkup from "./PWASplashMarkup";
import PWAZoomLock from "./PWAZoomLock";
import AiCampaignTracking from "@/components/ai/AiCampaignTracking";
import AiPostHogProvider from "@/components/analytics/AiPostHogProvider";
import { AI_COOKIE, verifyAIToken } from "@/lib/aiAuth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "آرایه AI | یک اکانت برای چند AI — فارسی و بدون VPN",
  description:
    "ChatGPT، Claude، Gemini و DeepSeek در یک حساب — بدون VPN و کارت خارجی. چت، مقایسه مدل‌ها و تولید محتوا.",
  openGraph: {
    title: "آرایه AI | یک اکانت برای چند AI — فارسی و بدون VPN",
    description:
      "ChatGPT، Claude، Gemini و DeepSeek در یک حساب — بدون VPN و کارت خارجی.",
    locale: "fa_IR",
    siteName: "آرایه",
  },
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
      { url: "/assets/ai-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/ai-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/assets/ai-icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F7F9",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(AI_COOKIE)?.value;
  const session = verifyAIToken(token);

  return (
    <AiPostHogProvider>
      <div className="ar-root">
        <PWASplashMarkup />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(sessionStorage.getItem('ar-pwa-splash-done')==='1'){document.documentElement.dataset.arSplashDone='1';}var s=window.matchMedia('(display-mode: standalone)').matches||window.matchMedia('(display-mode: fullscreen)').matches||(!!navigator.standalone);if(!s)return;document.documentElement.dataset.arPwa='1';var m=document.querySelector('meta[name="viewport"]');if(m){m.setAttribute('content','width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover');}}catch(e){}})();`,
          }}
        />
        <PWABootSplash />
        <PWARegister />
        <PWAZoomLock />
        <ArenaRscChrome />
        <AiCampaignTracking />
        <ArenaLayoutClient
          initialAuthed={!!session}
          initialUserId={session?.userId ?? null}
          initialPlan={session?.plan ?? "free"}
        >
          {children}
        </ArenaLayoutClient>
      </div>
    </AiPostHogProvider>
  );
}
