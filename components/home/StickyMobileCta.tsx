"use client";

import { useEffect, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";

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
        href="#cta"
        onClick={() => pushGtmEvent("cta_click", { location: "sticky_mobile" })}
        className="btn-primary w-full text-center"
      >
        مشاوره رایگان
      </a>
    </div>
  );
}
