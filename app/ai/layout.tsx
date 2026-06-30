import type { Metadata, Viewport } from "next";
import "./ai.css";

export const metadata: Metadata = {
  title: "اتاق فکر هوشمند | آرایه",
  description:
    "یک سؤال بپرس؛ چند هوش مصنوعی با هم فکر کنند و جواب بهتر بدهند.",
  manifest: "/ai.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "آرایه AI",
  },
  icons: {
    icon: "/assets/logo-icon-192.png",
    apple: "/assets/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  return <div className="ai-root">{children}</div>;
}
