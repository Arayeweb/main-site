"use client";

import { useEffect, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { openSiteChat } from "@/lib/openSiteChat";

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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 p-3 backdrop-blur-md sm:hidden">
      <a
        href="#chat"
        onClick={(event) => {
          event.preventDefault();
          pushGtmEvent("cta_click", { location: "sticky_mobile" });
          openSiteChat("sticky_mobile_cta");
        }}
        className="btn-primary w-full text-center"
      >
        شروع گفت‌وگو
      </a>
    </div>
  );
}
