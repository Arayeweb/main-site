"use client";

import { useEffect } from "react";

const SESSION_KEY = "ar-pwa-splash-done";
const MIN_MS = 450;
const MAX_MS = 2800;
const SPLASH_ID = "ar-pwa-splash";

function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const ios =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || ios;
}

function getSplashEl(): HTMLElement | null {
  return document.getElementById(SPLASH_ID);
}

function removeSplash(el: HTMLElement) {
  el.classList.add("ar-pwa-splash--out");
  window.setTimeout(() => {
    el.remove();
  }, 280);
}

/** Client controller — splash markup is SSR'd in layout for pre-hydrate paint. */
export default function PWABootSplash() {
  useEffect(() => {
    const el = getSplashEl();
    if (!el) return;

    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        el.remove();
        return;
      }
    } catch {
      /* ignore */
    }

    if (!isStandalonePwa()) {
      el.remove();
      return;
    }

    const started = performance.now();
    let cancelled = false;
    let finished = false;
    let maxTimer: ReturnType<typeof setTimeout> | undefined;
    let outTimer: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      if (cancelled || finished) return;
      finished = true;
      if (maxTimer) clearTimeout(maxTimer);
      const wait = Math.max(0, MIN_MS - (performance.now() - started));
      outTimer = setTimeout(() => {
        if (cancelled) return;
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
          document.documentElement.dataset.arSplashDone = "1";
        } catch {
          /* ignore */
        }
        const node = getSplashEl();
        if (node) removeSplash(node);
      }, wait);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      maxTimer = setTimeout(finish, MAX_MS);
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", finish);
      if (maxTimer) clearTimeout(maxTimer);
      if (outTimer) clearTimeout(outTimer);
    };
  }, []);

  return null;
}
