"use client";

import { useEffect } from "react";

const LOCKED_VIEWPORT =
  "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";

function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  const mq =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches;
  const ios =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || ios;
}

function lockViewport() {
  const meta = document.querySelector('meta[name="viewport"]');
  if (meta) meta.setAttribute("content", LOCKED_VIEWPORT);
  document.documentElement.dataset.arPwa = "1";
}

/** Keep installed PWA at fixed scale — no pinch / double-tap zoom. */
export default function PWAZoomLock() {
  useEffect(() => {
    if (!isStandalonePwa()) return;

    lockViewport();

    // iOS Safari can restore zoom after focus on inputs — re-lock on blur
    const onFocusOut = () => {
      window.setTimeout(lockViewport, 50);
    };
    document.addEventListener("focusout", onFocusOut);

    return () => {
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return null;
}
