"use client";

import { useEffect } from "react";

/** Registers the Araaye AI service worker (production / secure context only). */
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      navigator.serviceWorker.register("/ai/sw.js", { scope: "/ai" }).catch(() => {
        /* ignore registration failures (unsupported / blocked) */
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
