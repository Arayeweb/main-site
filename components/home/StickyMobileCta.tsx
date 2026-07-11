"use client";

import { useEffect, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { siteWhatsAppUrl } from "@/lib/siteContact";

const WHATSAPP_MESSAGE = "سلام، از سایت آرایه پیام می‌دهم.";

export default function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 p-3 pl-20 backdrop-blur-md sm:hidden">
      <a
        href={siteWhatsAppUrl(WHATSAPP_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          pushGtmEvent("cta_click", { location: "sticky_mobile", channel: "whatsapp" })
        }
        className="btn-primary w-full text-center"
      >
        پیام در واتساپ
      </a>
    </div>
  );
}
