"use client";

import { useEffect } from "react";
import type { KordianLocale } from "@/lib/showdemoto/dr-kordian/types";

/** Override root layout fa/rtl while Dr. Kordian EN/RU pages are active. */
export default function KordianHtmlLocale({ locale }: { locale: KordianLocale }) {
  useEffect(() => {
    const html = document.documentElement;
    const prevDir = html.getAttribute("dir");
    const prevLang = html.getAttribute("lang");

    html.setAttribute("dir", "ltr");
    html.setAttribute("lang", locale);

    return () => {
      if (prevDir) html.setAttribute("dir", prevDir);
      else html.removeAttribute("dir");
      if (prevLang) html.setAttribute("lang", prevLang);
      else html.removeAttribute("lang");
    };
  }, [locale]);

  return null;
}
