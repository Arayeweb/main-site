"use client";

import { useEffect, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";

export default function IndustryStickyCta({ label = "درخواست مشاوره" }: { label?: string }) {
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
        href="#consult-form"
        onClick={() => pushGtmEvent("cta_click", { location: "industry_sticky_mobile" })}
        className="inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white"
      >
        {label}
      </a>
    </div>
  );
}

